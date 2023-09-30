const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");



describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;

  beforeEach(async function () {
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1] = await ethers.getSigners();
    voting = await Voting.deploy(["Candidate 1", "Candidate 2"], 50); // 50 minutes duration
    await voting.deployed();
  });

  it("Should initialize with correct candidates and duration", async function () {
    const candidates = await voting.getAllVotesOfCandidates();
    expect(candidates[0].name).to.equal("Candidate 1");
    expect(candidates[1].name).to.equal("Candidate 2");

    const votingStatus = await voting.getVotingStatus();
    expect(votingStatus).to.equal(true);

    const remainingTime = await voting.getRemainingTime();
    //console.log("remainingTime: ", parseInt(remainingTime))
    expect(parseInt(remainingTime)).to.be.above(0);
  });

  it("Should allow adding a new candidate by owner", async function () {
    await voting.connect(owner).addCandidate("Candidate 3");
    const candidates = await voting.getAllVotesOfCandidates();
    //console.log("candidates: ", candidates)
    expect(candidates[2].name).to.equal("Candidate 3");
  });

  it("Should allow voting and update vote count", async function () {
    await voting.connect(addr1).vote(0);
    const candidates = await voting.getAllVotesOfCandidates();
    //console.log("candidates[0].voteCount: ", parseInt(candidates[0].voteCount));
    expect(parseInt(candidates[0].voteCount)).to.equal(1);

    // Try to vote again, should fail
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("You have already voted!");
    //await assert(voting.connect(addr1).vote(0)).to.equal("You have already voted!");
  });

  it("Should prevent voting after the end of the voting period", async function () {

    // Fast-forward time to end the voting period
    await ethers.provider.send("evm_increaseTime", [61 * 60]); // 61 minutes
    await ethers.provider.send("evm_mine", []);

    const votingStatus = await voting.getVotingStatus();
    //console.log("votingStatus: ", votingStatus);
    expect(votingStatus).to.equal(false);

    // console.log("After increase time using evm_increaseTime");
    // const remainingTime2 = await voting.getRemainingTime();
    // console.log("remainingTime: ", parseInt(remainingTime2));

    // Try to vote after the end of the voting period, should fail
    await expect(voting.connect(addr1).vote(0)).to.be.revertedWith("Voting has ended!");

    // try{
    //   await voting.connect(addr1).vote(0);
    // }
    // catch(err){
    //   console.log("err: ", err.message);
    // }
  });
});
