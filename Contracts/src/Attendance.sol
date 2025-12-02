// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IAttendance.sol";

contract Attendance is Ownable, ReentrancyGuard, IAttendance {
    uint256 public sessionCounter;

    // sessionId => student => bool
    mapping(uint256 => mapping(address => bool)) public hasAttended;
    mapping(uint256 => Session) public sessions;
    mapping(string => bool) public classExists;

    function createSession(
        string memory _className,
        uint256 _startTime,
        uint256 _endTime
    ) external override returns (uint256) {
        require(bytes(_className).length > 0, "className required");
        require(_endTime > _startTime, "endTime must be > startTime");
        require(!classExists[_className], "class already exists");

        sessionCounter++;
        uint256 id = sessionCounter;

        sessions[id] = Session({
            id: id,
            className: _className,
            startTime: _startTime,
            endTime: _endTime,
            lecturer: msg.sender,
            active: true,
            totalStudents: 0
        });

        classExists[_className] = true;

        emit SessionCreated(id, _className, _startTime);
        return id;
    }

    function attend(uint256 _sessionId) external override nonReentrant {
        Session storage s = sessions[_sessionId];
        require(s.id != 0, "session not found");
        require(s.active, "session not active");
        require(block.timestamp >= s.startTime && block.timestamp <= s.endTime, "not in session time");
        require(!hasAttended[_sessionId][msg.sender], "already attended");

        hasAttended[_sessionId][msg.sender] = true;
        s.totalStudents++;

        emit Attended(_sessionId, msg.sender, block.timestamp);
    }

    // Admin functions
    function setSessionActive(uint256 _sessionId, bool _active) external onlyOwner {
        require(sessions[_sessionId].id != 0, "session not found");
        sessions[_sessionId].active = _active;
    }
}
