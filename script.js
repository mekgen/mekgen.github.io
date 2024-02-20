// Initialize receiptCounter from localStorage or set to 1 if not available
let receiptCounter = parseInt(localStorage.getItem('receiptCounter')) || 1;

function incrementReceiptCounter() {
    receiptCounter++;
    localStorage.setItem('receiptCounter', receiptCounter);
    document.getElementById('receiptNumber').value = padReceiptNumber(receiptCounter);
}

function resetReceiptCounter() {
    receiptCounter = 1;
    localStorage.setItem('receiptCounter', receiptCounter);
    document.getElementById('receiptNumber').value = padReceiptNumber(receiptCounter);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('receiptNumber').value = padReceiptNumber(receiptCounter);
});

function padReceiptNumber(number) {
    return number.toString().padStart(4, '0');
}

function refreshPage() {
    location.reload();
}


/*function validateForm() {
    const form = document.getElementById('receiptForm');
    const elements = form.elements;
    let formIsValid = true;

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].type !== 'submit' && elements[i].type !== 'reset') {
            const fieldName = elements[i].name;
            const fieldValue = elements[i].value.trim();
            const errorElement = document.getElementById(`${fieldName}Error`);

            if (fieldValue === '') {
                errorElement.textContent = `${fieldName} is required`;
                formIsValid = false;
            } else {
                errorElement.textContent = ''; // Clear error message if field is filled
            }
        }
    }

    if (formIsValid) {
        // If all fields are filled, proceed with form submission
        generateReceipt();
    } else {
        // If any field is not filled, prevent form submission
        return false;
    }
    
    // Always prevent form submission to avoid the form being reset
    return false;
}*/

function generateAndSaveReceipt() {
    const receiptForm = document.getElementById('receiptForm');

    const date = receiptForm.elements['date'].value;
    const time = receiptForm.elements['time'].value;
    const name = receiptForm.elements['name'].value;
    const amount = receiptForm.elements['amount'].value;
    const payment = receiptForm.elements['payment'].value;
    const towards = receiptForm.elements['towards'].value;
    const receivedby = receiptForm.elements['receivedby'].value;

    const amountInput = document.getElementById('amount');
    const amountValue = amountInput.value;
    const amountInWords = convertToWords(amountValue);

    incrementReceiptCounter();

    document.getElementById('receiptNumber').value = padReceiptNumber(receiptCounter);

    const generatedReceipt = document.getElementById('generatedReceipt');
    generatedReceipt.innerHTML = `
        <div style="width: 5in; height: 4in; border: 2px solid #008000; padding: 8px ;">
            <h4>Masjid Chanda Receipt No.${padReceiptNumber(receiptCounter)}</h4>
            <h1 style="text-align: center; font-size: 35px; color: darkgreen; padding:0;">مسجد-ه-خاسمية </h1> 
            <h1 style="text-align: center; font-size: 24px; color: darkblue;">MASJID-E-KHASIMIAH</h1>
            <h2 style="text-align: center; font-size: 12px; color: black;"> No.8 church road, Murugesh Palya, Bangalore-560017</h2>
            <h2 style="text-align: center; font-size: 15px; font-family: Trebuchet MS; color: #DAA520; text-decoration: underline overline dotted green;"> KARNTAKAKA WAQF BOARD REG. NO: KWB/03/BLR/2006-07</h2>
            <h3 style="text-align: center; font-size: 12px; font-weight: bold; color: black;"> Mobile No. +91 9999944444, 9845909345, 9890244554</h3>
            <p> Received with thanks from : <u style="color: green;">${name}</u> on Date: <u style="color: green;">${date} at ${time}</u> </p>
            <p><strong>an amount of rupees ₹ </strong> <u style="color: green;">${amountValue} (${amountInWords})</u> through <u style="color: green;">${payment}</u> towards <u style="color: green;">${towards}.</u></p>
            <p><strong>Received by:</strong> <u style="color: green;">${receivedby}</u></p> 
            <img src="images/qr.png" alt="QR not avaliable" align="left";>
            <h6 style="text-align: right; font-size: 15px; font-family: Bradley hand; color:#DAA520; margin-top: 65px; padding:0;"> <u>Bank:</u> Union Bank <br> <u> A/c no.</u>: 5202020206584638 <br> <u> IFSC code:</u> UNIO753539 </h6>
        </div>
    `;

    saveReceiptToDatabase({
        receiptNumber: padReceiptNumber(receiptCounter),
        date,
        name,
        amount,
        payment,
        towards,
        receivedby,
    });

    document.getElementById('downloadButton').style.display = 'block';
}

function convertToWords(number) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertBlock(num) {
        let words = '';
        if (num >= 100) {
            words += units[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num >= 11 && num <= 19) {
            words += teens[num - 11] + ' ';
        } else if (num >= 20 || num === 10) {
            words += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num >= 1 && num <= 9) {
            words += units[num] + ' ';
        }
        return words;
    }

    let words = '';
    if (number === 0) {
        words = 'Zero';
    } else {
        if (number >= 1_000_000_000) {
            words += convertBlock(Math.floor(number / 1_000_000_000)) + 'Billion ';
            number %= 1_000_000_000;
        }
        if (number >= 1_000_000) {
            words += convertBlock(Math.floor(number / 1_000_000)) + 'Million ';
            number %= 1_000_000;
        }
        if (number >= 1000) {
            words += convertBlock(Math.floor(number / 1000)) + 'Thousand ';
            number %= 1000;
        }
        words += convertBlock(number);
    }

    return words.trim();
}

function saveReceiptToDatabase(receiptData) {
    // Send a POST request to your server to save the receipt data
    fetch('http://localhost:3000/api/receipts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

function downloadReceipt() {
    const receiptContent = document.getElementById('generatedReceipt');

    html2canvas(receiptContent, {
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');

        const currentDate = new Date().toISOString().slice(0, 10); // Get current date in 'YYYY-MM-DD' format
        const fileName = `Receipt_No.${receiptCounter}_${currentDate}.png`;

        link.href = imgData;
        link.download = fileName;
        link.click();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('receiptNumber').value = padReceiptNumber(receiptCounter);
});
