#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

const ANCHOR_ACCOUNT_DISCRIMINATOR: usize = 8;

#[program]
pub mod voting {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64,
         description: String, poll_start: u64, poll_end: u64) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.candidate_amount = 0;    
        Ok(())
    }

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>, name: String, _poll_id: u64) -> Result<()>{
        let candidate = &mut ctx.accounts.candidate;
        candidate.name = name;
        candidate.votes = 0;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, poll_id: u64)]
pub struct InitializeCandidate<'info>{
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(seeds = [poll_id.to_le_bytes().as_ref()],
        bump)]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_ACCOUNT_DISCRIMINATOR + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

// Is the actual Candidate account on chain
#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(50)]
    pub name: String,

    pub votes: u64,
}

// Is The Instruction for Poll Account Initialization
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init, 
        payer = signer, 
        space = ANCHOR_ACCOUNT_DISCRIMINATOR + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump)]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}


// Is the actual Poll account on chain 
#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,

    #[max_len(280)]
    pub description: String,

    pub poll_start: u64,

    pub poll_end: u64,

    pub candidate_amount: u64,
}
