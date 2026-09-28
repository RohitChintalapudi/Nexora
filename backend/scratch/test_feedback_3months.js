// Test 3-month feedback period logic
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

console.log('--- Testing 3-Month Feedback Recurrence Logic ---');

function checkEligibility(lastSubmittedDate) {
  if (!lastSubmittedDate) {
    return { isEligible: true, daysRemaining: 0 };
  }
  const lastSubmittedTime = new Date(lastSubmittedDate).getTime();
  const nextEligibleTime = lastSubmittedTime + THREE_MONTHS_MS;
  const isEligible = Date.now() >= nextEligibleTime;
  const daysRemaining = Math.max(0, Math.ceil((nextEligibleTime - Date.now()) / (1000 * 60 * 60 * 24)));
  return { isEligible, daysRemaining, nextEligibleTime: new Date(nextEligibleTime) };
}

// Case 1: First time user (never submitted feedback)
const case1 = checkEligibility(null);
console.log('Case 1 (Never submitted):', case1);
if (!case1.isEligible) throw new Error('Case 1 failed');

// Case 2: User submitted feedback 5 days ago
const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const case2 = checkEligibility(fiveDaysAgo);
console.log('Case 2 (Submitted 5 days ago):', case2);
if (case2.isEligible || case2.daysRemaining !== 85) throw new Error('Case 2 failed');

// Case 3: User submitted feedback 91 days ago (over 3 months)
const ninetyOneDaysAgo = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
const case3 = checkEligibility(ninetyOneDaysAgo);
console.log('Case 3 (Submitted 91 days ago):', case3);
if (!case3.isEligible || case3.daysRemaining !== 0) throw new Error('Case 3 failed');

console.log('🎉 ALL 3-MONTH FEEDBACK PERIOD TESTS PASSED!');
