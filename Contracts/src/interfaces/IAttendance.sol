// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAttendance {
    event SessionCreated(uint256 indexed sessionId, string className, uint256 startTime);
    event Attended(uint256 indexed sessionId, address indexed student, uint256 timestamp);

    struct Session {
        uint256 id;
        string className;
        uint256 startTime;
        uint256 endTime;
        address lecturer;
        bool active;
        uint256 totalStudents;
    }

    function createSession(string calldata _className, uint256 _startTime, uint256 _endTime) external returns (uint256);
    function attend(uint256 _sessionId) external;
}
