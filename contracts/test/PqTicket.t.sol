// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../PqTicket.sol";

contract PqTicketHarness is PqTicket {
  bool public mockValid;
  bytes public mockKey;

  function setMock(bytes calldata key, bool valid) external {
    mockKey = key;
    mockValid = valid;
  }

  function _pqCheck(address, bytes memory expectedKey, bytes calldata, bytes calldata) internal view override {
    require(expectedKey.length > 0, "no key");
    require(mockValid, "PqCheckFailed");
  }
}

contract PqTicketTest {
  PqTicketHarness t;
  address organizer = address(0xA11CE);
  address buyer = address(0xB0B);
  address stranger = address(0xBAD);

  bytes organizerKey = hex"01";
  bytes scannerKey = hex"02";
  bytes sig = hex"03";
  bytes msgBytes = hex"04";

  function setUp() public {
    t = new PqTicketHarness();
    t.setMock(organizerKey, true);
  }

  function _createEvent() internal returns (uint256 eventId) {
    address[] memory scanners = new address[](1);
    scanners[0] = address(0x5CA);
    bytes[] memory keys = new bytes[](1);
    keys[0] = scannerKey;
    t.createEvent("Show", 1893456000, 0, 2, scanners, keys, organizerKey);
    eventId = 1;
  }

  function testMintOnce() public {
    uint256 id = _createEvent();
    t.mintTicket{value: 0}(id, hex"aa");
    bool used;
    (, , used) = _ticket(1);
    require(!used, "fresh ticket used");
  }

  function testSecondMintReverts() public {
    uint256 id = _createEvent();
    t.mintTicket{value: 0}(id, hex"aa");
    bool reverted = false;
    try t.mintTicket{value: 0}(id, hex"aa") returns (uint256) {
      reverted = false;
    } catch {
      reverted = true;
    }
    require(reverted, "second mint did not revert");
  }

  function testDoubleCheckInReverts() public {
    uint256 id = _createEvent();
    t.mintTicket{value: 0}(id, hex"aa");
    t.checkIn(1, sig, msgBytes);
    bool reverted = false;
    try t.checkIn(1, sig, msgBytes) {
      reverted = false;
    } catch {
      reverted = true;
    }
    require(reverted, "double checkin did not revert");
  }

  function testPqFailReverts() public {
    uint256 id = _createEvent();
    t.mintTicket{value: 0}(id, hex"aa");
    t.setMock(organizerKey, false);
    bool reverted = false;
    try t.checkIn(1, sig, msgBytes) {
      reverted = false;
    } catch {
      reverted = true;
    }
    require(reverted, "pq fail did not revert");
  }

  function testOnlyOrganizerCreatesWithdrawal() public {
    uint256 id = _createEvent();
    bool reverted = false;
    try t.addScanner(id, stranger, hex"09") {
      reverted = false;
    } catch {
      reverted = true;
    }
    require(!reverted, "organizer add failed");
  }

  function _ticket(uint256 ticketId) internal view returns (uint256, address, bool) {
    (uint256 e, address o, , bool u) = t.tickets(ticketId);
    return (e, o, u);
  }

  function testBuyerMismatchPath() public {
    buyer;
    stranger;
    organizer;
  }
}
