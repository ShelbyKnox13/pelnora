# Binary Calculation System - Pelnora MLM

## Overview
The binary calculation system has been completely rewritten to provide **real-time, accurate earnings** based on actual package purchases and proper 2:1 or 1:2 matching logic with carry forward functionality.

## Key Features

### ✅ Real-Time Calculations
- **No more demo earnings** - All calculations happen when packages are purchased
- **Immediate income distribution** when new members join
- **Accurate business volume** based on actual package amounts

### ✅ Proper Binary Matching
- **2:1 or 1:2 ratio matching** based on team member count
- **Actual package amounts** used for volume calculation (not fixed ₹50,000)
- **Carry forward system** for unmatched volumes

### ✅ Carry Forward System
- **Unmatched volumes** are stored and used in future calculations
- **Persistent across sessions** - stored in database
- **Automatic calculation** when new members join

## How It Works

### 1. Volume Calculation
```javascript
// Left team volume = sum of all left team member package amounts + carry forward
leftVolume = leftCarryForward + sum(leftTeamPackages)

// Right team volume = sum of all right team member package amounts + carry forward  
rightVolume = rightCarryForward + sum(rightTeamPackages)
```

### 2. Binary Matching Logic
```javascript
// Check if 2:1 or 1:2 matching is possible
if ((leftCount >= 2 && rightCount >= 1) || (leftCount >= 1 && rightCount >= 2)) {
  // Calculate binary income based on weaker side
  weakerSideVolume = Math.min(leftVolume, rightVolume)
  binaryIncome = weakerSideVolume × 0.05 // 5%
}
```

### 3. Carry Forward Update
```javascript
// After matching, remaining volume becomes carry forward
matchedVolume = Math.min(leftVolume, rightVolume)
newLeftCarryForward = leftVolume - matchedVolume
newRightCarryForward = rightVolume - matchedVolume
```

## Example Scenarios

### Scenario 1: Basic Binary Matching
**Team Structure:**
- Left: 3 people with ₹3,000 packages = ₹9,000
- Right: 2 people with ₹10,000 packages = ₹20,000

**Calculation:**
- Weaker side: ₹9,000
- Binary income: ₹9,000 × 5% = ₹450
- Carry forward: Left ₹0, Right ₹11,000

### Scenario 2: Carry Forward Usage
**Initial State:**
- Left carry forward: ₹0
- Right carry forward: ₹11,000 (from previous scenario)

**New Member Joins Left:**
- New left member: ₹5,000 package
- Total left volume: ₹0 + ₹5,000 = ₹5,000
- Total right volume: ₹11,000

**New Calculation:**
- Weaker side: ₹5,000
- Binary income: ₹5,000 × 5% = ₹250
- New carry forward: Left ₹0, Right ₹6,000

## Database Schema Updates

### New Fields Added to Users Table:
```sql
leftCarryForward NUMERIC DEFAULT 0 NOT NULL
rightCarryForward NUMERIC DEFAULT 0 NOT NULL
```

## Income Distribution

### 1. Direct Income (5%)
- Paid immediately to direct referrer
- Based on monthly package amount
- One-time payment at signup

### 2. Binary Income (5%)
- Calculated for entire upline (up to 10 levels)
- Based on weaker side volume
- Includes carry forward volumes
- Real-time calculation when new members join

### 3. Level Income (1%)
- Distributed across 5 upline levels
- Only paid if upline user has unlocked that level
- Based on monthly package amount

## Key Improvements

### ❌ Before (Issues Fixed):
- Fixed ₹50,000 volume per member
- Demo earnings that weren't real
- No carry forward system
- Simplified binary logic

### ✅ After (Current System):
- **Actual package amounts** for volume calculation
- **Real-time earnings** on package purchase
- **Proper carry forward** system
- **Accurate 2:1 or 1:2 matching**
- **Upline binary calculation** (10 levels)

## Testing

The system has been tested with various scenarios:
- ✅ Different package amounts
- ✅ Carry forward functionality  
- ✅ Multiple binary matches
- ✅ Upline income distribution
- ✅ Real-time calculation triggers

## Migration

A database migration has been created to add the new carry forward fields:
```sql
-- File: server/migrations/0009_add_carry_forward_fields.sql
ALTER TABLE users 
ADD COLUMN left_carry_forward NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN right_carry_forward NUMERIC DEFAULT 0 NOT NULL;
```

## Verification

To verify the system is working correctly:
1. Create test users with different package amounts
2. Place them on left/right sides
3. Check earnings are calculated in real-time
4. Verify carry forward values are updated
5. Test multiple binary matches

The binary calculation system now provides accurate, real-time earnings based on actual business volume with proper carry forward functionality.