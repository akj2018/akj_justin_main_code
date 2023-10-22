// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract EWasteTracking is AccessControl {

    // Define roles
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CONSUMER_ROLE = keccak256("CONSUMER_ROLE");
    bytes32 public constant REFURBISHER_ROLE = keccak256("REFURBISHER_ROLE");
    bytes32 public constant RECYCLER_ROLE = keccak256("RECYCLER_ROLE");
    bytes32 public constant ENVIRONMENT_ROLE = keccak256("ENVIRONMENT_ROLE");
    bytes32 public constant GOVERNMENT_ROLE = keccak256("GOVERNMENT_ROLE");

    struct Component {
        string componentName;
        string material;
    }

    struct LifecycleEvent {
        string eventDescription;
        uint256 timestamp;
    }

    struct DisposalEvent {
        string disposalMethod;
        string disposalDate;
        string location;
        string disposedBy;
    }

    mapping(uint256 => EWastePassport) public passports;

    constructor() {
        _setupRole(AccessControl.DEFAULT_ADMIN_ROLE, msg.sender);  // Set deployer as the default admin
        _setupRole(MANUFACTURER_ROLE, msg.sender);
        _setupRole(DISTRIBUTOR_ROLE, msg.sender);
        _setupRole(RETAILER_ROLE, msg.sender);
        _setupRole( CONSUMER_ROLE, msg.sender);
        _setupRole( REFURBISHER_ROLE, msg.sender);
        _setupRole( RECYCLER_ROLE, msg.sender);
        _setupRole( ENVIRONMENT_ROLE, msg.sender);
        _setupRole( GOVERNMENT_ROLE, msg.sender);

    }

    struct EWastePassport {
        string phoneName;
        string manufacturer;
        uint256 imeiNumber;
        uint256 manufactureDate;
        uint256 expectedLifecycle;
        bool isBatteryReplaceable;
        Component[] components;
        LifecycleEvent[] lifecycleEvents;
        DisposalEvent disposalEvent;
        AdditionalDetails additionalDetails;
    }

    
    struct AdditionalDetails {
        bool is5GCapable;                // 5G capability
        uint256 releaseDate;             // Convert Release Date from string to uint256 (timestamp format)
        string os;                       // iOS
        string chipset;                  // Apple A14 Bionic
        uint16 phoneMemory;                  // 128 (in GB, using uint16 should suffice)
        string batteryType;              // Lithium-ion
        string condition;                // Very Good
        uint8 expectedLifecycle;         // 5 (in years, uint8 should be enough)
        uint256 achievedLifecycle;       // 0.1 (convert this into a percentage or fraction for accuracy, uint256)
    }

    event PassportCreated(
        uint256 imeiNumber,
        string phoneName,
        string manufacturer,
        uint256 expectedLifecycle,
        uint256 manufactureDate,
        bool isBatteryReplaceable
    );

    function createNewPassport(
        uint256 _imeiNumber,
        string memory _phoneName,
        string memory _manufacturer,
        uint256 _expectedLifecycle,
        uint256 _manufactureDate,
        bool _isBatteryReplaceable
    ) public {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Unauthorized!");
        require(passports[_imeiNumber].imeiNumber != _imeiNumber, "IMEI already exists!");

        EWastePassport storage newPassport = passports[_imeiNumber];
        
        newPassport.phoneName = _phoneName;
        newPassport.manufacturer = _manufacturer;
        newPassport.imeiNumber = _imeiNumber;
        newPassport.manufactureDate = _manufactureDate;
        newPassport.expectedLifecycle = _expectedLifecycle;
        newPassport.isBatteryReplaceable = _isBatteryReplaceable;
        newPassport.disposalEvent = DisposalEvent("", "", "", "");

        emit PassportCreated(
            _imeiNumber,
            _phoneName,
            _manufacturer,
            _expectedLifecycle,
            _manufactureDate,
            _isBatteryReplaceable
        );
    }

    function updateAdditionalDetails(
        uint256 _imeiNumber,
        bool _is5GCapable,
        uint256 _releaseDate,
        string memory _os,
        string memory _chipset,
        uint16 _phoneMemory,
        string memory _batteryType,
        string memory _condition,
        uint8 _additionalExpectedLifecycle,
        uint256 _achievedLifecycle
    ) public {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Unauthorized!");
        require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

        EWastePassport storage passportToUpdate = passports[_imeiNumber];

        passportToUpdate.additionalDetails = AdditionalDetails({
            is5GCapable: _is5GCapable,
            releaseDate: _releaseDate,
            os: _os,
            chipset: _chipset,
            phoneMemory: _phoneMemory,
            batteryType: _batteryType,
            condition: _condition,
            expectedLifecycle: _additionalExpectedLifecycle,
            achievedLifecycle: _achievedLifecycle
        });
    }

    function addComponentsToPassport(
        uint256 _imeiNumber,
        string[] memory _componentNames,
        string[] memory _materials
    ) public {
        require(hasRole(MANUFACTURER_ROLE, msg.sender), "Unauthorized!");
        require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");
        require(_componentNames.length == _materials.length, "Arrays length mismatch");

        EWastePassport storage passportToUpdate = passports[_imeiNumber];

        for (uint256 i = 0; i < _componentNames.length; i++) {
            Component memory newComponent = Component({
                componentName: _componentNames[i],
                material: _materials[i]
            });
            passportToUpdate.components.push(newComponent);
        }
    }


    // Helper function to convert address to string (useful for logging in eventDescription)
    function addressToString(address _address) private pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";
        
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }


    event SellTransaction(
        uint256 indexed imeiNumber,
        string actionPerformed,
        string sourceEntityType,
        address indexed sourceEntityAddress,
        string targetEntityType,
        address indexed targetEntityAddress
    );  

    function sellTransaction(
        uint256 _imeiNumber,
        string memory sourceEntityType,
        string memory targetEntityType,
        address sourceEntityAddress,
        address targetEntityAddress) 
        public {
            
            require(hasRole(MANUFACTURER_ROLE, msg.sender) || hasRole(DISTRIBUTOR_ROLE, msg.sender) || 
                    hasRole(RETAILER_ROLE, msg.sender) || hasRole(REFURBISHER_ROLE, msg.sender), "Unauthorized!");

            require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

            string memory actionPerformed = "sell";

            string memory eventDescription;

            eventDescription = string(abi.encodePacked(
                sourceEntityType, " ", actionPerformed, " to ", targetEntityType
            ));

             LifecycleEvent memory newEvent = LifecycleEvent({
                eventDescription: eventDescription,
                timestamp: block.timestamp
            });    

            emit SellTransaction(_imeiNumber, actionPerformed ,sourceEntityType, sourceEntityAddress, targetEntityType, targetEntityAddress);

            passports[_imeiNumber].lifecycleEvents.push(newEvent);
    }

    event GiveTransaction(
        uint256 indexed imeiNumber,
        string actionPerformed,
        string sourceEntityType,
        address indexed sourceEntityAddress,
        string targetEntityType,
        address indexed targetEntityAddress
    );  

    function giveTransaction(
        uint256 _imeiNumber,
        string memory sourceEntityType,
        string memory targetEntityType,
        address sourceEntityAddress,
        address targetEntityAddress) 
        public {
            
            require(hasRole(MANUFACTURER_ROLE, msg.sender) || hasRole(CONSUMER_ROLE, msg.sender) || 
                    hasRole(REFURBISHER_ROLE, msg.sender), "Unauthorized!");

            require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

            string memory actionPerformed = "give";

            string memory eventDescription;

            eventDescription = string(abi.encodePacked(
                sourceEntityType, " ", actionPerformed, " to ", targetEntityType
            ));

             LifecycleEvent memory newEvent = LifecycleEvent({
                eventDescription: eventDescription,
                timestamp: block.timestamp
            });    

            emit GiveTransaction(_imeiNumber, 
                                actionPerformed, 
                                sourceEntityType, 
                                sourceEntityAddress, 
                                targetEntityType, 
                                targetEntityAddress);

            passports[_imeiNumber].lifecycleEvents.push(newEvent);
    }

    event ReturnTransaction(
        uint256 indexed imeiNumber,
        string actionPerformed,
        string sourceEntityType,
        address indexed sourceEntityAddress,
        string targetEntityType,
        address indexed targetEntityAddress
    );  

    function returnTransaction(
        uint256 _imeiNumber,
        string memory sourceEntityType,
        string memory targetEntityType,
        address sourceEntityAddress,
        address targetEntityAddress) 
        public {
            
            require(hasRole(CONSUMER_ROLE, msg.sender) || hasRole(REFURBISHER_ROLE, msg.sender), "Unauthorized!");

            require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

            string memory actionPerformed = "return";

            string memory eventDescription;

            eventDescription = string(abi.encodePacked(
                sourceEntityType, " ", actionPerformed, " to ", targetEntityType
            ));

             LifecycleEvent memory newEvent = LifecycleEvent({
                eventDescription: eventDescription,
                timestamp: block.timestamp
            });     

            emit ReturnTransaction(
                _imeiNumber, 
                actionPerformed, 
                sourceEntityType, 
                sourceEntityAddress, 
                targetEntityType, 
                targetEntityAddress
            );


            passports[_imeiNumber].lifecycleEvents.push(newEvent);
    } 

event DisposeTransaction(
    uint256 indexed imeiNumber,
    string actionPerformed,
    string sourceEntityType,
    address indexed sourceEntityAddress,
    string targetEntityType,
    address indexed targetEntityAddress
);  

function disposeTransaction(
    uint256 _imeiNumber,
    string memory sourceEntityType,
    address sourceEntityAddress,     
    string memory _disposalMethod,  
    string memory _disposalDate,
    string memory _disposalLocation)
    public {
        
        require(hasRole(CONSUMER_ROLE, msg.sender) || hasRole(REFURBISHER_ROLE, msg.sender) || 
                hasRole(RECYCLER_ROLE, msg.sender) || hasRole(MANUFACTURER_ROLE, msg.sender), "Unauthorized!");

        require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

        string memory actionPerformed = "dispose";

        passports[_imeiNumber].disposalEvent.disposalMethod = _disposalMethod;
        passports[_imeiNumber].disposalEvent.disposalDate = _disposalDate;
        passports[_imeiNumber].disposalEvent.location = _disposalLocation;
        passports[_imeiNumber].disposalEvent.disposedBy = addressToString(sourceEntityAddress);

        string memory eventDescription;

        eventDescription = string(abi.encodePacked(
            actionPerformed, " by ", sourceEntityType
        ));

        LifecycleEvent memory newEvent = LifecycleEvent({
            eventDescription: eventDescription,
            timestamp: block.timestamp
        });   

        passports[_imeiNumber].lifecycleEvents.push(newEvent);

        // Emit the event
        emit DisposeTransaction(
            _imeiNumber, 
            actionPerformed, 
            sourceEntityType, 
            sourceEntityAddress,
            "disposal center",  // Empty targetEntityType
            address(0)
        );
}

    // event GovernmentTransactionRequest(
    //     uint256 indexed imeiNumber,
    //     address indexed requestorAddress
    // );

    // function governmentTransaction(uint256 _imeiNumber) public returns (EWastePassport memory) {
    //     require(hasRole(GOVERNMENT_ROLE, msg.sender), "Unauthorized!");

    //     // Emitting the event
    //     emit GovernmentTransactionRequest(_imeiNumber, msg.sender);

    //     return passports[_imeiNumber];
    // }

    // Returns the number of lifecycle events for a given IMEI
    function getLifecycleEventsCount(uint256 _imeiNumber) public view returns (uint256) {
        return passports[_imeiNumber].lifecycleEvents.length;
    }

    // Returns the lifecycle event at a specified index for a given IMEI
    function getLifecycleEvent(uint256 _imeiNumber, uint256 index) public view returns (string memory eventDescription, uint256 timestamp) {
        require(index < passports[_imeiNumber].lifecycleEvents.length, "Index out of bounds");
        LifecycleEvent memory lifecycleEvent = passports[_imeiNumber].lifecycleEvents[index];
        return (lifecycleEvent.eventDescription, lifecycleEvent.timestamp);
    }

    function getDisposalDetails(uint256 imeiNumber) public view returns (string memory, string memory, string memory, string memory) {
        DisposalEvent memory disposal = passports[imeiNumber].disposalEvent;
        return (disposal.disposalMethod, disposal.disposalDate, disposal.location, disposal.disposedBy);
    }

    function getPassportByIMEI(uint256 _imeiNumber) public view returns (EWastePassport memory) {
        return passports[_imeiNumber];
    }

    // event EnvironmentTransactionEvent(
    //     uint256 indexed imeiNumber,
    //     address indexed requestorAddress
    // );

    // function environmentTransaction(uint256 _imeiNumber) public returns (LifecycleEvent[] memory, DisposalEvent memory) {
    //     require(hasRole(ENVIRONMENT_ROLE, msg.sender), "Unauthorized!");
    //     require(passports[_imeiNumber].imeiNumber == _imeiNumber, "IMEI does not exist!");

    //     // Emitting the event
    //     emit EnvironmentTransactionEvent(_imeiNumber, msg.sender);

    //     return (passports[_imeiNumber].lifecycleEvents, passports[_imeiNumber].disposalEvent);
    // }
    

}