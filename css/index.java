int addTwoDigits(int n){
	String digitStr = String.valueOf(n); 
	char[] digitsArray = digitStr.toCharArray(); 
	int len = digitsArray.length; 
	int sum = 0;
	for(int i =0; i < len; i++){

		sum = sum + Integer.valueOf(String.valueOf(digitsArray[i]));
	}

	return sum;
}