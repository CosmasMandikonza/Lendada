# LendADA Demo Script for Cardano Summit Hackathon

## Prerequisites
- Yaci DevKit running (local Cardano devnet)
- Backend API running on port 3000
- Masumi AI Agent running on port 3001
- Frontend running on port 5173
- Cardano wallet (Nami, Eternl, or Flint) connected to devnet

## Demo Flow (15 minutes)

### Part 1: Platform Overview (2 minutes)

**Narrator Script:**
"Welcome to LendADA, a privacy-first microloan platform built on Cardano. We're solving the problem of low DeFi activity on Cardano by providing easy access to credit through:
- AI-driven credit scoring
- Zero-knowledge identity verification
- Smart contract-secured loans
- Reputation-based lending"

**Actions:**
1. Navigate to homepage (localhost:5173)
2. Highlight key features
3. Show statistics dashboard

### Part 2: Borrower Journey (5 minutes)

#### Step 1: Wallet Connection (30 seconds)
**Actions:**
1. Click "Connect Wallet"
2. Select Nami/Eternl
3. Approve connection
4. Show wallet address appears in header

**Narrator:**
"First, users connect their Cardano wallet. This is the only authentication needed."

#### Step 2: Identity Verification (2 minutes)
**Actions:**
1. Navigate to Dashboard
2. See "Identity Verification Required" prompt
3. Fill in KYC form:
   - Name: "John Doe"
   - DOB: "1990-01-01"
   - Country: "United States"
   - ID: "ABC123456"
4. Click "Verify Identity & Mint NFT"
5. Approve transaction in wallet
6. Show ZK proof generation
7. Show Identity NFT minted

**Narrator:**
"LendADA uses zero-knowledge proofs for KYC. Personal data never touches the blockchain - only a cryptographic proof is stored in the identity NFT. This ensures privacy while maintaining compliance."

#### Step 3: Credit Score Calculation (1 minute)
**Actions:**
1. Show Credit Score widget loading
2. Masumi AI agent analyzes on-chain data:
   - Transaction history
   - Staking activity
   - DeFi interactions
   - Account age
3. Display credit score: 720
4. Show risk level: "MEDIUM"
5. Show approval amount: 5,000 ADA

**Narrator:**
"Our AI agent analyzes on-chain behavior to calculate a credit score in seconds. No manual review needed."

#### Step 4: Loan Request (1.5 minutes)
**Actions:**
1. Navigate to "Borrow" page
2. Enter loan details:
   - Amount: 1,000 ADA
   - Duration: 30 days
3. Show real-time calculation:
   - Interest: 22.47 ADA (8%)
   - Collateral: 1,500 ADA
   - Total repayment: 1,022.47 ADA
4. Click "Request Loan"
5. Approve transaction (sends collateral to smart contract)
6. Show loan created with status "PENDING"

**Narrator:**
"The borrower locks 150% collateral in a smart contract. This protects lenders while allowing borrowers to access credit."

### Part 3: Lender Journey (3 minutes)

#### Step 1: Browse Available Loans (1 minute)
**Actions:**
1. Open new browser/profile (simulate different user)
2. Connect lender wallet
3. Navigate to "Lend" page
4. Show list of available loans
5. Filter by risk level
6. View loan details

**Narrator:**
"Lenders can browse available loans, filtered by risk level and return rate."

#### Step 2: Fund Loan (1 minute)
**Actions:**
1. Click "Fund This Loan" on borrower's loan
2. Review loan terms
3. Approve transaction (sends 1,000 ADA to contract)
4. Show loan status changes to "FUNDED"

**Narrator:**
"When a lender funds a loan, the ADA is held in escrow. The borrower can now claim it."

#### Step 3: Borrower Claims Funds (1 minute)
**Actions:**
1. Switch back to borrower wallet
2. Refresh dashboard
3. See loan status "FUNDED"
4. Click "Claim Funds"
5. Approve transaction
6. Show 1,000 ADA received
7. Loan status changes to "ACTIVE"

**Narrator:**
"The borrower claims the funds, and the 30-day repayment period begins."

### Part 4: Repayment & Reputation (3 minutes)

#### Step 1: Make Repayment (1.5 minutes)
**Actions:**
1. Navigate to loan details
2. Show repayment breakdown
3. Show days remaining counter
4. Enter repayment amount: 1,022.47 ADA
5. Click "Repay Loan"
6. Approve transaction
7. Show loan status changes to "REPAID"

**Narrator:**
"When the borrower repays, they get their collateral back plus their reputation improves."

#### Step 2: Reputation Update (1 minute)
**Actions:**
1. Show reputation points increased
2. Show credit score improved to 745
3. Show reputation NFT minted
4. Display updated borrowing limit: 7,500 ADA

**Narrator:**
"Successful repayments build reputation and improve credit scores, unlocking larger loans at better rates."

#### Step 3: Lender Receives Repayment (30 seconds)
**Actions:**
1. Switch to lender wallet
2. Show 1,022.47 ADA received
3. Show 2.25% return in 5 minutes
4. Highlight loan marked "REPAID"

**Narrator:**
"The lender receives principal plus interest. All secured by smart contracts."

### Part 5: Technical Deep Dive (2 minutes)

**Show Code/Architecture:**
1. **Smart Contracts (Aiken):**
   - Display loan escrow validator
   - Show eUTxO model benefits
   - Highlight deterministic fees

2. **AI Agent (Masumi):**
   - Show credit scoring algorithm
   - Demonstrate on-chain data analysis
   - Display Masumi agent endpoints

3. **ZK Proofs:**
   - Show proof generation
   - Explain privacy preservation
   - Display CIP-68 metadata

**Narrator:**
"Built with Cardano-native technologies:
- Aiken smart contracts for security
- Masumi AI for credit scoring
- CIP-68 for identity NFTs
- Mesh SDK for seamless integration"

## Default Scenario (If Live Demo Fails)

### Backup Demo Video
Record a comprehensive walkthrough covering all steps above. Prepare to play this if:
- Network issues occur
- Wallet connection fails
- Smart contracts error

### Static Presentation Slides
Include screenshots of:
- Complete user flow
- Code examples
- Architecture diagrams
- Credit scoring algorithm
- Transaction confirmations

## Questions & Answers (3 minutes)

### Expected Questions:

**Q: How do you handle defaults?**
A: "If a borrower doesn't repay, the lender can claim the 150% collateral after the due date. The smart contract automates this process."

**Q: Is the AI credit scoring fair?**
A: "Yes - it's transparent and based only on verifiable on-chain behavior. The algorithm is open-source and can be audited."

**Q: How is privacy maintained?**
A: "We use zero-knowledge SNARKs. KYC data is verified off-chain, and only a cryptographic proof goes on-chain. Even we can't see your personal information."

**Q: What prevents malicious actors?**
A: "Multiple layers: identity verification, collateral requirements, reputation system, and smart contract security. Plus, our AI can detect suspicious patterns."

**Q: Can this scale?**
A: "Absolutely. Cardano's eUTxO model allows parallel processing. We can also integrate Hydra Layer-2 for even higher throughput."

## Post-Demo Actions

1. **Share Links:**
   - GitHub repository
   - Live demo site
   - Documentation

2. **Invite Feedback:**
   - Judge questions
   - Community input
   - Partnership opportunities

3. **Highlight Future Plans:**
   - Fiat on-ramps
   - Real-World Asset integration
   - Mobile app
   - Hydra scaling
   - Multi-chain expansion
