// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQorePQC {
  function pqcVerify(bytes calldata pubkey, bytes calldata signature, bytes calldata message) external view returns (bool valid);
  function pqcKeyStatus(address account) external view returns (bool registered, uint8 algorithmId, bytes memory pubkey);
}

contract PqTicket {
  address constant PQC_PRECOMPILE = 0x0000000000000000000000000000000000000a01;

  struct EventInfo {
    address organizer;
    bytes organizerPqKey;
    string name;
    uint64 dateUnix;
    uint256 price;
    uint256 maxSupply;
    uint256 minted;
    bool active;
  }

  struct Ticket {
    uint256 eventId;
    address owner;
    bytes pqPubkey;
    bool used;
  }

  uint256 public nextEventId = 1;
  uint256 public nextTicketId = 1;

  mapping(uint256 => EventInfo) public events;
  mapping(uint256 => Ticket) public tickets;
  mapping(uint256 => mapping(address => bool)) public hasTicket;
  mapping(uint256 => mapping(address => bool)) public isScanner;
  mapping(uint256 => mapping(address => bytes)) public scannerPqKey;
  mapping(uint256 => address[]) public eventScanners;

  event EventCreated(uint256 indexed eventId, address indexed organizer, string name);
  event ScannerAdded(uint256 indexed eventId, address indexed scanner);
  event Minted(uint256 indexed eventId, uint256 indexed ticketId, address indexed owner);
  event CheckedIn(uint256 indexed eventId, uint256 indexed ticketId, address indexed scanner);

  error NotOrganizer();
  error NotAuthorized();
  error InactiveEvent();
  error SoldOut();
  error AlreadyHasTicket();
  error WrongPrice();
  error AlreadyUsed();
  error PqCheckFailed();

  modifier onlyOrganizer(uint256 eventId) {
    if (msg.sender != events[eventId].organizer) revert NotOrganizer();
    _;
  }

  function createEvent(
    string calldata name,
    uint64 dateUnix,
    uint256 price,
    uint256 maxSupply,
    address[] calldata scanners,
    bytes[] calldata scannerKeys,
    bytes calldata organizerKey
  ) external returns (uint256 eventId) {
    require(maxSupply > 0, "maxSupply 0");
    require(scanners.length <= 3, "max 3 scanners");
    require(scanners.length == scannerKeys.length, "key mismatch");
    require(organizerKey.length > 0, "organizer key needed");
    eventId = nextEventId++;
    EventInfo storage e = events[eventId];
    e.organizer = msg.sender;
    e.organizerPqKey = organizerKey;
    e.name = name;
    e.dateUnix = dateUnix;
    e.price = price;
    e.maxSupply = maxSupply;
    e.active = true;
    for (uint256 i = 0; i < scanners.length; i++) {
      if (scanners[i] != address(0) && !isScanner[eventId][scanners[i]]) {
        isScanner[eventId][scanners[i]] = true;
        scannerPqKey[eventId][scanners[i]] = scannerKeys[i];
        eventScanners[eventId].push(scanners[i]);
      }
    }
    emit EventCreated(eventId, msg.sender, name);
  }

  function addScanner(uint256 eventId, address scanner, bytes calldata scannerKey) external onlyOrganizer(eventId) {
    require(eventScanners[eventId].length < 3, "max 3 scanners");
    require(scanner != address(0), "zero scanner");
    require(!isScanner[eventId][scanner], "already scanner");
    require(scannerKey.length > 0, "scanner key needed");
    isScanner[eventId][scanner] = true;
    scannerPqKey[eventId][scanner] = scannerKey;
    eventScanners[eventId].push(scanner);
    emit ScannerAdded(eventId, scanner);
  }

  function mintTicket(uint256 eventId, bytes calldata pqPubkey) external payable returns (uint256 ticketId) {
    EventInfo storage e = events[eventId];
    if (!e.active) revert InactiveEvent();
    if (e.minted >= e.maxSupply) revert SoldOut();
    if (hasTicket[eventId][msg.sender]) revert AlreadyHasTicket();
    if (msg.value != e.price) revert WrongPrice();
    ticketId = nextTicketId++;
    tickets[ticketId] = Ticket({ eventId: eventId, owner: msg.sender, pqPubkey: pqPubkey, used: false });
    hasTicket[eventId][msg.sender] = true;
    e.minted += 1;
    emit Minted(eventId, ticketId, msg.sender);
  }

  function _pqCheck(address actor, bytes memory expectedKey, bytes calldata pqSignature, bytes calldata pqMessage) internal view virtual {
    if (expectedKey.length == 0) revert PqCheckFailed();
    bool valid = IQorePQC(PQC_PRECOMPILE).pqcVerify(expectedKey, pqSignature, pqMessage);
    if (!valid) revert PqCheckFailed();
    actor;
  }

  function checkIn(uint256 ticketId, bytes calldata pqSignature, bytes calldata pqMessage) external {
    Ticket storage t = tickets[ticketId];
    EventInfo storage e = events[t.eventId];
    bytes memory actorKey;
    if (msg.sender == e.organizer) {
      actorKey = e.organizerPqKey;
    } else if (isScanner[t.eventId][msg.sender]) {
      actorKey = scannerPqKey[t.eventId][msg.sender];
    } else {
      revert NotAuthorized();
    }
    if (t.used) revert AlreadyUsed();
    _pqCheck(msg.sender, actorKey, pqSignature, pqMessage);
    t.used = true;
    emit CheckedIn(t.eventId, ticketId, msg.sender);
  }

  function withdraw(uint256 eventId) external onlyOrganizer(eventId) {
    uint256 amount = address(this).balance;
    (bool ok, ) = payable(events[eventId].organizer).call{value: amount}("");
    require(ok, "withdraw failed");
  }

  function scannersOf(uint256 eventId) external view returns (address[] memory) {
    return eventScanners[eventId];
  }
}
