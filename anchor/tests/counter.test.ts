import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { BN, Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'

const IDL = require('../target/idl/voting.json')
const votingAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

describe('Voting', () => {
  it('Initialize Voting', async () => {
    const context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    const provider = new BankrunProvider(context)
    const votingProgram = new Program<Voting>(IDL, provider)
    const pollId = new anchor.BN(1)
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, 'le', 8)], // must be little-endian 8 bytes
      votingProgram.programId,
    )

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        'what is your favorite programming language?',
        new anchor.BN(0),
        new anchor.BN(1759508293),
      )
      .rpc()

    const pollAccount = await votingProgram.account.poll.fetch(pollAddress)
    console.log(pollAccount)

    expect(pollAccount.pollId.toNumber()).toEqual(1)
    expect(pollAccount.description).toEqual('what is your favorite programming language?')
    expect(pollAccount.pollStart.toNumber()).toBeLessThan(pollAccount.pollEnd.toNumber())
  })
})
