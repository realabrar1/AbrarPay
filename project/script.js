// QR Code generation function
function generateQRCode(text) {
    const qr = new QRious({
        element: document.getElementById('qrcode'),
        value: text,
        size: 200
    });
}

// Toast notification function
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Tab switching
function switchTab(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    
    tabs[tabIndex].classList.add('active');
    panels[tabIndex].classList.add('active');
}

// Generate payment link
function generateLink() {
    const upiId = document.getElementById('upiId').value.trim();
    const amount = document.getElementById('amount').value;
    
    if (!upiId) {
        showToast('Please enter UPI ID or phone number');
        return;
    }
    
    // Format UPI ID
    const formattedUpiId = upiId.includes('@') ? upiId : `${upiId}@paytm`;
    
    // Validate input
    if (upiId.includes('@')) {
        if (!/^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/i.test(upiId)) {
            showToast('Please enter a valid UPI ID');
            return;
        }
    } else if (upiId.length === 10) {
        if (!/^\d{10}$/.test(upiId)) {
            showToast('Please enter a valid 10-digit phone number');
            return;
        }
    }
    
    const upiLink = `gpay://upi/pay?pa=${formattedUpiId}${amount ? `&am=${amount}` : ''}`;
    generateQRCode(upiLink);
    document.getElementById('paymentAmount').textContent = amount ? `₹${amount}` : 'custom amount';
    document.getElementById('paymentUpiId').textContent = formattedUpiId;
    
    // Store link for sharing
    window.paymentLink = upiLink;
    
    // Switch to payment tab
    switchTab(1);
    showToast('Payment link generated!');
}

// Handle payment
function handlePayment() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        const paymentTimeout = setTimeout(() => {
            showToast('No UPI payment app found! Download Google Pay');
        }, 2500);
        
        window.location.href = window.paymentLink;
        
        window.addEventListener('blur', () => {
            clearTimeout(paymentTimeout);
        });
    } else {
        showToast('Please scan the QR code with your mobile UPI app to pay');
    }
}

// Share payment link
async function handleShare() {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'Abrar-Pay Payment Link',
                text: `Pay using UPI: ${window.paymentLink}`,
                url: window.paymentLink
            });
        } else {
            copyToClipboard();
        }
    } catch (error) {
        copyToClipboard();
    }
}

// Copy to clipboard
function copyToClipboard() {
    navigator.clipboard.writeText(window.paymentLink);
    showToast('Link copied to clipboard!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.addEventListener('click', () => switchTab(index));
    });
    
    document.getElementById('generateBtn').addEventListener('click', generateLink);
    document.getElementById('payBtn').addEventListener('click', handlePayment);
    document.getElementById('shareBtn').addEventListener('click', handleShare);
});