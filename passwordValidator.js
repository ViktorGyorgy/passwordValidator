//coder: Viktor Gyorgy
//problem4
//command to run the script: node passwordValidator

//assumptions: 'aaA' are not 3 repeating characters
//              the letters are only from the english latin alphabet
//the code is  optimised under the assumption that a password can be 100000 characters long




//the ideas behind the algorithm:
//three cases: password is too short, password length is good, password is too long

//case 1 (too short):
//  either we need to add characters to fill the length, or to add the needed character types
//      (lowercase letter, uppercase letter, digit)
//      examples: "ababa" is 5 long, but we need to add an uppercase letter and a digit, so 2 modification is needed
//                "a1A" has all the needed char types, but we need to add 3 characters for the length
//
//  with the repeated characters there won't be a problem, because they can be repeated at maximum 5 times
//  and then we need to add 2 or 3 char types, which willl separate thme
//      example: "aaaaa" => "aaBaa1a"


//case 2(rigth length):
//  the least amount of modification can be achieved if we only swap characters
//      this is because if we have "aaaaab..." => "aa1aab..." is 1 step,
//      but we would need to delete 3 charater to achieve "aab..."
//  we need to watch out for the missing char types also
//
//  The algorithm: get every string part which has 3 repeated characters which shouldn't overlap,
//      and swap the most right character of them out (if needed with the missing char type)
//      examples: from "aaaaabccc" we only get ["aaa", "ccc"]
//                but from "aaaaaabccc" we get ["aaa", "aaa", "ccc"]
//  max(charTypesMissing, numberOfRepeatedCharacters)


//case 3 (too long):
//  we need to delete characters anyways to get to the right length
//  so we atleast need lengthOfString - 20 characters deleted
//  and after that we get back to case 2, and do the algortihm from there,
//      because it will have the right length, but still can have repeated chars, or missing charTypes
//
//  we should be deleting from the repeated characters, so we don't have to swap them out
//      after we get to the right length
//      and it's important from which on we delete
//          example: "aaaaaccc1A", if we delete an a, we still need 2 changes from "aaaaccc1A"
//                               but, if we delete an c we need only one change from "aaaaacc1A"
//                               "aaaaacc1A" => "aabaacc1A"
//
//  so it is best to delete from repeated characters where if $len is the times the char is repeated
//      then we should delete in this order from them:
//          1. $len % 3 == 0
//          2. $len % 3 == 1
//          3. $len % 3 == 2 
//
//  this is because if we have 5 characters at the end of a reapeated char list,
//      then we can correct the 5 characters with only 1 change

//  algorithm:
//      0. changesNeeded = lengthOfString - 20; 
//      1. Get an array of all the maximal string parts where the character is repeated at least 3 times
//          example: from "aaaaaaabbcccddddd" => ["aaaaaaa", "ccc", "ddddd"]
//      2. Transform the string array into a len array:
//              ["aaaaaaa", "ccc", "ddddd"] => [7, 3, 5]
//      3. put them into a moduloArray, depending on their  length % 3
//              [7, 3, 5] => moduloArray = [[3], [7], [5]]
//      4. first remove a character from elements from moduloArray[0],
//          while we need to delete characters, and there are elements in moduloArray[0]
//          Note: we shouldn't put back elements if we they are < 3
//              [[3], [7], [5]] => ([[], [7], [5]], x = 3--) => [[], [7], [5]]
//      5. do the same for moduloArray[1], but remove 2 characters everywhere while charactersNeededToRemove > 1
//              [[], [7], [5]] => ([[], [], [5]], x = 7 -2) => [[], [], [5, 5]]
//      6. same stuff for moduloArray[2], but remove 3 characters everywhere while charactersNeededToRemove > 2
//              [[], [], [5, 5]] => ([[], [], [5]], x= 5 - 3) => [[], [], [5]]
//      7. if we have the right string length (less than 21 characters), we go back to case 2 (right string length):
//          a) if $len is a length of a repeated characters string, 
//              then we need to change integerPartOf($len / 3)
//          b) we sum those up, to get the minSwapsNeeded
//          c) changesNeeded += max(minSwapsNeeded, charTypesNeeded)
//      8. return changesNeeded




function minimumChangesNeededForStrongPassword(s){
    if(typeof s !== 'string'){
        return -1;
    }

    //(true if doesn't have uppercase letter) + (true if doesn't have lowercase letter) + (true if doesn't have a number)
    //javascript converts these to numbers and adds them together
    let characterTypesNeeded =    !/[A-Z]/.test(s) 
                                + !/[a-z]/.test(s) 
                                + !/[0-9]/.test(s);

    //different options in case of length
    
    if(s.length < 6){
        //easiest case, string too short
        let lengthChangeNeeded = 6 - s.length;
        return Math.max(lengthChangeNeeded, characterTypesNeeded);
    }
    else if(s.length < 20){
        //the length is good

        //regex which means any character, and the same character 2 times after it
        //the strings in the array don't overlap in the original string
        //(example: from 'aaaaabbb' only returns ['aaa', 'bbb'])
        let repeatedParts = s.match(/(.)\1{2}/g);
        //console.log(repeatedParts)

        //tenary operator: if repeatedParts is not null, give back the length of it, otherwise 0
        return Math.max(repeatedParts ? repeatedParts.length : 0, characterTypesNeeded);
    }
    else{
        //trickiest case, string too long
        let lengthChangeNeeded = s.length - 20;
        
        //we get the maximum possible row of same characters, which is longer than 3 characters
        let repeatedCharacters = s.match(/(.)\1{2,}/g);

        //if there are no repeatedCharacters
        if(repeatedCharacters === null){
            return lengthChangeNeeded + characterTypesNeeded;
        }


        //we then assign them to arrays by their length modulo 3
        let arrayModulo = [[], [], []];
        repeatedCharacters.forEach(x => arrayModulo[x.length % 3].push(x.length));
     
        //we need atleast to delete lengthChangeNeeded number of characters
        let finalNumberOfChangesThatWereNeeded = lengthChangeNeeded;

        //while we need to delete characters, and have lengths which modulo by 3 is 0
        while(lengthChangeNeeded > 0 && arrayModulo[0].length){
            let current = arrayModulo[0].pop();
            --current; //we delete a character from this part
            --lengthChangeNeeded;
            //the length changed, so length modulo 3 also changed
            if(current > 2){
                arrayModulo[2].push(current);
            }
        }

        //now length modulo 1
        while(lengthChangeNeeded > 1 && arrayModulo[1].length){
            let current = arrayModulo[1].pop();
            current -= 2; //we delete two characters from this part
            --lengthChangeNeeded;
            //the length changed, so length modul 3 also changed
            if(current > 2){
                arrayModulo[2].push(current);
            }
        }

        //it is possible that here lengthChangeNeeded is 1
        //but deleting a character from "aaaa" for example won't make a difference 
        //in the number of characters needed to change
        while(lengthChangeNeeded > 2 && arrayModulo[2].length){
            let current = arrayModulo[2].pop();
            current -= 3; //we delete three characters from this part
            lengthChangeNeeded -= 3;
            //the length changed, so length modul 3 also changed
            if(current > 2){
                arrayModulo[2].push(current);
            }
        }

        //same situation like in commment from line 147

        //now we get how many character we need to change in every part and sum it up
        let needToStillChange = arrayModulo.map(arr => arr.map(x => Math.floor(x / 3)).reduce((a, b) => a+b, 0))
                                            .reduce((a, b) => a+b, 0);


        //in the end, if we don't need to chage up parts of 3 len substrings, we maybe still need the obligatory character types
        finalNumberOfChangesThatWereNeeded += Math.max(needToStillChange, characterTypesNeeded);

        return finalNumberOfChangesThatWereNeeded;
    }
}

//----TEST CASES-----

//not a string
console.log("1: " + minimumChangesNeededForStrongPassword(1));

//it's shorter than 6 characters
console.log("-----SHORTER---------");
str = "a"; "abcdE1"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "hello"; "hello1A"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "aaaaa"; //can be "aaAaa1"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "aaAaa"; //can be "aaAaa1"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "-----"; //can be "--a--Z1"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));


//it's the right length
console.log("-----GOOD LENGTH---------");
str = "aaaaaa"; // "aa1aaA"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "aa1BaaB"; //
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "a".repeat(20); //"aa1".repeat(6) + "aa"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "abbbaab"; //"ab1baaB"
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));


//it's too long
console.log("-----LONGER---------");
str = "abcdefg12A".repeat(3); //10 * 3 long string
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "a".repeat(5) + "b".repeat(5) + "c".repeat(5) + "d".repeat(6);
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "abcdegh12A".repeat(2) + "b".repeat(5); //25 char long string
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));
str = "abcdefg12A".repeat(1000000); //10 * 1000000 long string
console.log("The really long string: " + minimumChangesNeededForStrongPassword(str));
str = "-".repeat(25);
console.log(str + ": " + minimumChangesNeededForStrongPassword(str)); //5 delete, 20/3 = 6 swap
str = 'abc'.repeat(7);
console.log(str + ": " + minimumChangesNeededForStrongPassword(str));