const { expect } = require('chai');

describe('Attendance', function () {
    let Attendance, attendance, owner, student;

    beforeEach(async function () {
        [owner, student] = await ethers.getSigners();
        Attendance = await ethers.getContractFactory('Attendance');
        attendance = await Attendance.deploy();
        await attendance.deployed();
    });

    it('creates a session and allows a student to attend', async function () {
        const now = Math.floor(Date.now() / 1000);
        const start = now - 10; // already started
        const end = now + 3600; // 1 hour later

        const tx = await attendance.connect(owner).createSession('CS101', start, end);
        const receipt = await tx.wait();
        const event = receipt.events.find((e) => e.event === 'SessionCreated');
        const sessionId = event.args.sessionId.toNumber();

        // student attends
        await attendance.connect(student).attend(sessionId);

        const attended = await attendance.hasAttended(sessionId, student.address);
        expect(attended).to.be.true;

        const s = await attendance.sessions(sessionId);
        expect(s.totalStudents).to.equal(1);
    });
});
