import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { BN, Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'

/*
To run these tests:
  anchor test --skip-deploy --skip-local-validator


*/

const IDL = require('../target/idl/voting.json')
const votingAddress = new PublicKey('JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H')

let context
let provider
let votingProgram

describe('Voting', () => {
  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    provider = new BankrunProvider(context)
    votingProgram = new Program<Voting>(IDL, provider)
  })

  it('Initialize Voting', async () => {
    const pollId = new anchor.BN(1)

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        'what is your favorite programming language?',
        new anchor.BN(0),
        new anchor.BN(1759508293),
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, 'le', 8)], // must be little-endian 8 bytes
      votingProgram.programId,
    )

    const pollAccount = await votingProgram.account.poll.fetch(pollAddress)
    console.log(pollAccount)

    expect(pollAccount.pollId.toNumber()).toEqual(1)
    expect(pollAccount.description).toEqual('what is your favorite programming language?')
    expect(pollAccount.pollStart.toNumber()).toBeLessThan(pollAccount.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
    const pollId = new anchor.BN(1)
    const name = 'Aaron'

    await votingProgram.methods.initializeCandidate(name, pollId).rpc()

    const [aaronAddress] = PublicKey.findProgramAddressSync(
      [
        pollId.toArrayLike(Buffer, 'le', 8), // must be little-endian 8 bytes
        Buffer.from(name),
      ],
      votingProgram.programId,
    )

    const aaronAccount = await votingProgram.account.candidate.fetch(aaronAddress)

    expect(aaronAccount.name).toEqual('Aaron')
    console.log(aaronAccount)
  })

  it('Vote', async () => {})
})
