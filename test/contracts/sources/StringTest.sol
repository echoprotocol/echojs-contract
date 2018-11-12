pragma solidity ^0.4.24;

contract StringTest {

	string str;

	function setString(string _str) public {
		str = _str;
	}

	function stringLength() public view returns (uint256) {
		return bytes(str).length;
	}

}
