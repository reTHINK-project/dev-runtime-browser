/**
   * Calculates the Bloom filter containing all non-private contacts.
   * created by ishan210788@gmail.com
   * Date: 09.07.2016
   */


  function calculateBloomFilter1Hop(guid, contact, internal) {
    console.log('AddressBook Log: Inside bloom filter');
    let bloom = new BloomFilter(
      4314,   // number of bits to allocate. With 300 entries, we have a false positive rate of 0.001 %.
      10       // number of hash functions.
    );
        bloom.add('djfndskfhidsjfdsflsdfdsfdssadsadf');
        bloom.add('8787d67iew8re7wf7ew8fg8ewfy89wef7');
      if(contact._guid == 'se23ghd7899dfnf99i3n3mo039hii93jtest123') {
        //adding alice's GUID who is not in the contactList to the first contact
        console.log('AddressBook Log: Added bXBhhJm-o40WBIcXQQECH0-_MqNux6p3ANxt7lFA-Mg to Charlie\'s Bloom Filter ');
        bloom.add('bXBhhJm-o40WBIcXQQECH0-_MqNux6p3ANxt7lFA-Mg');
      }
    if(!internal) {
      let body = window.runtime.runtime.setBloomFilter1HopContact(guid, bloom);
		let success = body.success;
		console.log('Bloom Filter success status: ' + success);
    }
    return bloom;
  }
/*
  function checkGUID(contactList, guid) {
      let directContactsArray = [];
      let fofContactsArray = [];
      for (let i = 0; i < contactList.length; i++) {
        let bf1hop =  calculateBloomFilter1Hop(contactList[i]._guid, contactList[i], true);
        if (contactList[i]._guid == guid) {
          console.log('AddressBook Log: Direct contact: '+ contactList[i]._firstName);
          directContactsArray.push(contactList[i]);
        }
        if (bf1hop !== undefined) {
          if (bf1hop.test(guid)) {
            console.log('AddressBook Log: Mutual contact is: '+ contactList[i]._firstName);
            fofContactsArray.push(contactList[i]);
          }
        }
      }
      let rtnArray = [];
      rtnArray.push(directContactsArray, fofContactsArray);
      return rtnArray;
    }
*/
