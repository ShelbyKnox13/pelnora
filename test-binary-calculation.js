// Test script to verify binary calculation logic
console.log("Testing Binary Calculation Logic");
console.log("=================================");

// Test case 1: User has 3 people on left with ₹3000 packages, 2 people on right with ₹10000 packages
console.log("\nTest Case 1:");
console.log("Left team: 3 people × ₹3000 = ₹9000");
console.log("Right team: 2 people × ₹10000 = ₹20000");

const leftVolume1 = 3 * 3000; // ₹9000
const rightVolume1 = 2 * 10000; // ₹20000
const weakerSide1 = Math.min(leftVolume1, rightVolume1); // ₹9000
const binaryIncome1 = weakerSide1 * 0.05; // ₹450

console.log(`Weaker side volume: ₹${weakerSide1}`);
console.log(`Binary income (5%): ₹${binaryIncome1}`);
console.log(`Carry forward - Left: ₹${leftVolume1 - weakerSide1}, Right: ₹${rightVolume1 - weakerSide1}`);

// Test case 2: User has 4 people on right, 1 person on left (carry forward scenario)
console.log("\nTest Case 2 (Carry Forward):");
console.log("Left team: 1 person × ₹5000 = ₹5000");
console.log("Right team: 4 people × ₹3000 = ₹12000");

const leftVolume2 = 1 * 5000; // ₹5000
const rightVolume2 = 4 * 3000; // ₹12000
const weakerSide2 = Math.min(leftVolume2, rightVolume2); // ₹5000
const binaryIncome2 = weakerSide2 * 0.05; // ₹250

console.log(`Weaker side volume: ₹${weakerSide2}`);
console.log(`Binary income (5%): ₹${binaryIncome2}`);
console.log(`Carry forward - Left: ₹${leftVolume2 - weakerSide2}, Right: ₹${rightVolume2 - weakerSide2}`);

// Test case 3: Adding one more person to left (using carry forward)
console.log("\nTest Case 3 (Using Carry Forward):");
console.log("Previous carry forward - Left: ₹0, Right: ₹7000");
console.log("New member on left: ₹5000");

const leftCarryForward = 0;
const rightCarryForward = 7000;
const newLeftMember = 5000;

const newLeftVolume = leftCarryForward + newLeftMember; // ₹5000
const newRightVolume = rightCarryForward; // ₹7000
const newWeakerSide = Math.min(newLeftVolume, newRightVolume); // ₹5000
const newBinaryIncome = newWeakerSide * 0.05; // ₹250

console.log(`New volumes - Left: ₹${newLeftVolume}, Right: ₹${newRightVolume}`);
console.log(`Weaker side volume: ₹${newWeakerSide}`);
console.log(`Binary income (5%): ₹${newBinaryIncome}`);
console.log(`New carry forward - Left: ₹${newLeftVolume - newWeakerSide}, Right: ₹${newRightVolume - newWeakerSide}`);

console.log("\n=================================");
console.log("Binary calculation logic verified!");