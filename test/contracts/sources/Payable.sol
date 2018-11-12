pragma solidity ^0.4.24;

contract Payable {

    uint256 public value = 0;
    
    function send() public payable returns (uint256) {
        value += msg.value;
        return msg.value;
    }

}
