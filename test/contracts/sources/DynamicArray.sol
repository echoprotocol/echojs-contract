pragma solidity ^0.4.24;


contract DynamicArray {

	uint32[] _array;

	function setArray(uint32[] array) public {
		_array = array;
	}

	function getByIndex(uint256 index) public view returns (uint32) {
		require(index < _array.length, "out of index");
		return _array[index];
	}

	function getLength() public view returns (uint256) {
		return _array.length;
	}

}
