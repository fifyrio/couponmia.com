# Cashback System Database Setup

This directory contains SQL scripts for setting up the cashback system database functions.

## Setup Instructions

### 1. Run the Database Functions

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `cashback-functions.sql`
4. Paste and execute the SQL script

This will create the necessary database functions for:
- Updating user pending cashback
- Confirming cashback transactions
- Calculating cashback amounts
- Getting user available balance

### 2. Sync Cashback Rates

After setting up the database functions, run:

```bash
# Sync all store cashback rates
node scripts/sync-cashback-rates.js sync

# Set special category rates
node scripts/sync-cashback-rates.js special

# Check database functions
node scripts/sync-cashback-rates.js functions

# Run all operations
node scripts/sync-cashback-rates.js all
```

### 3. Verify Setup

You can verify the setup by checking:
- The `store_cashback_rates` table has data
- Database functions are accessible
- No error messages during sync

## Functions Created

- `exec_sql(text)` - Execute arbitrary SQL (service_role only)
- `update_user_pending_cashback(uuid, numeric)` - Update user pending cashback
- `confirm_cashback_transaction(uuid)` - Confirm transaction and update totals
- `calculate_cashback(integer, numeric)` - Calculate cashback for a transaction
- `get_user_available_cashback(uuid)` - Get user's available balance

## Security

- Most functions are granted to `authenticated` users
- `exec_sql` is restricted to `service_role` for security
- All functions use proper error handling and validation