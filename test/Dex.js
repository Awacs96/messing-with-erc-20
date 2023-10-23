const { expect } = require("chai");

describe("DEX", () => {
    let tokenSupply = "100";

    let token;
    let dex;
    let price = 100;

    let owner;
    let addr1;
    let addr2

    before(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy(tokenSupply);

        const DEX = await ethers.getContractFactory("DEX");
        dex = await DEX.deploy(token.address, price);
    });

    describe("Sell", () => {
        it("Should fail if contract is not authorized to sell", async () => {
            await expect(dex.sell()).to.be.reverted;
        });

        it("Should allow sett allowance", async () => {
            await token.approve(dex.address, 100);
        });

        it("Should not allow a non-owner to sell", async () => {
            await expect(dex.connect(addr1).sell()).to.be.reverted;
        });

        it("Sell should transfer tokens", async () => {
            await expect(dex.sell()).to.changeTokenBalances(token, [owner.address, dex.address], [-100, 100]);
        });
    });

    describe("Getters", () => {
        it("Should return correct token balance", async () => {
            expect(await dex.getTokenBalance()).to.equal(100);
        });

        it("Should return correct token price", async () => {
            expect(await dex.getPrice(5)).to.equal(price * 5);
        });
    });

    describe("Buy", () => {
        it("User can buy tokens", async () => {
            await expect(dex.connect(addr1).buy(10, {value: 1000})).to.changeTokenBalances(token, [dex.address, addr1.address], [-10, 10]);
        });

        it ("User cannot buy invalid number of tokens", async () => {
            await expect(dex.connect(addr1).buy(91, {value: 9100})).to.be.reverted;
        });

        it ("User cannot buy tokens with incorrect funds sent", async () => {
            await expect(dex.connect(addr1).buy(10, {value: 100})).to.be.reverted;
        });
    });

    describe("Withdraw tokens", () => {
        it("Non-owner cannot withdraw the remaining tokens", async () => {
            await expect(dex.connect(addr2).withdrawTokens()).to.be.reverted;
        });

        it("Owner can withdraw the remaining tokens", async () => {
            await expect(dex.withdrawTokens()).to.changeTokenBalances(token, [dex.address, owner.address], [-90, 90]);
        });
    });

    describe("Withdraw funds", () => {
        it("Non-owner cannot withdraw the available funds", async () => {
            await expect(dex.connect(addr1).withdrawFunds()).to.be.reverted;
        });

        it("Owner can withdraw the available funds", async () => {
            await expect(dex.withdrawFunds()).to.changeEtherBalances([dex.address, owner.address], [-1000, 1000]);
        });

        it("Owner cannot withdraw already withdrawn funds", async () => {
            await expect(dex.withdrawFunds()).to.changeEtherBalances([dex.address, owner.address], [0, 0]);
        });
    });

});