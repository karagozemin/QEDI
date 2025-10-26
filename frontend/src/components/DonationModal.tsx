import { useRef, memo } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import confetti from 'canvas-confetti';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileOwner: string;
  username: string;
}

const DonationModal = memo(({ isOpen, onClose, profileOwner, username }: DonationModalProps) => {
  const donationInputRef = useRef<HTMLInputElement>(null);
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' 
      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
      : 'bg-gradient-to-r from-red-500 to-rose-500';
    
    toast.className = `fixed top-8 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-8 py-4 rounded-2xl shadow-2xl z-[10000] font-semibold text-lg flex items-center gap-3`;
    
    const icon = type === 'success'
      ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`
      : `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;
    
    toast.innerHTML = `${icon} ${message}`;
    document.body.appendChild(toast);
    
    // Fade in animation
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleDonate = async () => {
    const donationAmount = donationInputRef.current?.value || '';
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!profileOwner) {
      showToast('Profile owner not found', 'error');
      return;
    }

    try {
      const tx = new Transaction();
      const amountInMist = Math.floor(parseFloat(donationAmount) * 1_000_000_000); // Convert SUI to MIST
      
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], profileOwner);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Donation successful:', result);
            triggerConfetti();
            onClose();
            showToast(`Successfully sent ${donationAmount} SUI! 🎉`, 'success');
            if (donationInputRef.current) {
              donationInputRef.current.value = '';
            }
          },
          onError: (error) => {
            console.error('Donation failed:', error);
            showToast('Donation failed. Please try again.', 'error');
          },
        }
      );
    } catch (error) {
      console.error('Error creating donation transaction:', error);
      showToast('Failed to create transaction', 'error');
    }
  };

  const handleClose = () => {
    onClose();
    if (donationInputRef.current) {
      donationInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/20 p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Send Donation</h3>
          <p className="text-gray-300">Support @{username}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (SUI)
          </label>
          <input
            ref={donationInputRef}
            type="text"
            inputMode="decimal"
            defaultValue=""
            onInput={(e) => {
              const input = e.currentTarget;
              const value = input.value;
              // Allow only numbers and decimal point
              if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
                input.value = value.slice(0, -1);
              }
            }}
            placeholder="0.0"
            autoComplete="off"
            autoFocus={false}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
          />
          <div className="flex gap-2 mt-3">
            {['0.5', '1', '5', '10'].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  if (donationInputRef.current) {
                    donationInputRef.current.value = amount;
                  }
                }}
                className="flex-1 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {amount} SUI
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDonate}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
          >
            Send Donation
          </button>
        </div>
      </div>
    </div>
  );
});

DonationModal.displayName = 'DonationModal';

export default DonationModal;

