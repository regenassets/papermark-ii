// Billing stubs - all billing features removed
export const CANCELLATION_REASONS = [];
export const PAUSE_DURATIONS = [];
export const CancellationModal = () => null;
export const PauseSubscriptionModal = () => null;
export const FeedbackModal = () => null;
export const RetentionOfferModal = () => null;
export const ConfirmCancellationModal = () => null;
export const handleCancellation = async () => ({ success: false, message: "Billing disabled" });
export const handlePause = async () => ({ success: false, message: "Billing disabled" });
export const handleUnpause = async () => ({ success: false, message: "Billing disabled" });
export const handleReactivate = async () => ({ success: false, message: "Billing disabled" });
export const sendPauseResumeNotification = async () => null;
export const automaticUnpause = async () => null;
