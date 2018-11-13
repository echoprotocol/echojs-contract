pragma solidity ^0.4.24;

contract UInt8 {

	uint8 public value;

	function set(uint8 _value) public returns (uint8) {
		value = _value;
		return _value;
	}

}
