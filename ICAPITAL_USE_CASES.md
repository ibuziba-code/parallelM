# iCapital Identity Solutions - Parallel Markets SDK Use Cases & Case Studies

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [Case Study 1: Private Equity Fund Onboarding](#case-study-1-private-equity-fund-onboarding)
3. [Case Study 2: Real Estate Investment Platform](#case-study-2-real-estate-investment-platform)
4. [Case Study 3: Multi-Entity Family Office](#case-study-3-multi-entity-family-office)
5. [Case Study 4: Institutional Allocator Portal](#case-study-4-institutional-allocator-portal)
6. [Case Study 5: Secondary Market Trading Platform](#case-study-5-secondary-market-trading-platform)
7. [Case Study 6: Feeder Fund Structure](#case-study-6-feeder-fund-structure)
8. [Case Study 7: International Investor Compliance](#case-study-7-international-investor-compliance)
9. [Case Study 8: Automated Reaccreditation Workflow](#case-study-8-automated-reaccreditation-workflow)
10. [Testing Scenarios & Edge Cases](#testing-scenarios--edge-cases)
11. [Performance Testing Scenarios](#performance-testing-scenarios)
12. [Compliance & Regulatory Scenarios](#compliance--regulatory-scenarios)

---

## Executive Overview

This document provides detailed use cases and case studies for mastering the Parallel Markets SDK integration at iCapital. Each case study includes:
- Business context and requirements
- Technical implementation details
- Code examples and configurations
- Testing procedures
- Success metrics
- Common pitfalls and solutions

---

## Case Study 1: Private Equity Fund Onboarding

### Business Context
**Client**: Blackstone Alternative Asset Management
**Fund**: Blackstone Private Credit Fund (BCRED)
**Investment Minimum**: $2,500 for Class I shares
**Investor Types**: Accredited individuals, QPs, institutions

### Requirements
1. Verify accreditation status before allowing fund selection
2. Support both individual and institutional investors
3. Collect required documents based on investor type
4. Integration with existing Blackstone portal
5. Audit trail for compliance

### Technical Implementation

#### Step 1: Initial Configuration
```javascript
// Configuration for PE fund onboarding
const blackstoneConfig = {
  client_id: process.env.BLACKSTONE_PM_CLIENT_ID,
  environment: 'production',
  flow_type: 'redirect', // More secure for high-value transactions
  redirect_uri: 'https://investors.blackstone.com/auth/callback',
  scopes: [
    'profile',
    'accreditation_status',
    'identity',
    'documents',
    'entities'
  ],
  theme: {
    primaryColor: '#000000',
    fontFamily: 'Helvetica Neue, Arial, sans-serif'
  },
  prefill: {
    minimum_investment: 2500,
    fund_id: 'BCRED'
  }
}
```

#### Step 2: Investor Classification Flow
```javascript
class BlackstoneInvestorOnboarding {
  constructor() {
    this.parallel = null
    this.investorProfile = null
    this.eligibleFunds = []
  }

  async initialize() {
    try {
      this.parallel = await loadParallel(blackstoneConfig)
      this.setupEventListeners()
      return true
    } catch (error) {
      console.error('SDK initialization failed:', error)
      this.handleFallback()
      return false
    }
  }

  setupEventListeners() {
    this.parallel.subscribe('auth.statusChange', async (status) => {
      if (status.status === 'connected') {
        await this.processInvestor(status.authResponse)
      }
    })
  }

  async processInvestor(authResponse) {
    // Step 1: Get investor profile
    this.investorProfile = await this.parallel.getProfile()

    // Step 2: Classify investor
    const classification = this.classifyInvestor(this.investorProfile)

    // Step 3: Determine eligible funds
    this.eligibleFunds = await this.getEligibleFunds(classification)

    // Step 4: Check documentation requirements
    const requiredDocs = this.getRequiredDocuments(classification)

    // Step 5: Verify documentation status
    const docStatus = await this.verifyDocumentation(requiredDocs)

    // Step 6: Create investor record
    await this.createInvestorRecord({
      profile: this.investorProfile,
      classification,
      eligibleFunds: this.eligibleFunds,
      documentStatus: docStatus,
      authToken: authResponse.access_token
    })
  }

  classifyInvestor(profile) {
    const classification = {
      type: profile.type, // 'individual' or 'business'
      accreditationStatus: profile.accreditation_status,
      investorCategory: null,
      riskProfile: null,
      documentationLevel: null
    }

    // Determine investor category based on profile
    if (profile.type === 'individual') {
      if (profile.net_worth > 5000000) {
        classification.investorCategory = 'QUALIFIED_PURCHASER'
        classification.documentationLevel = 'ENHANCED'
      } else if (profile.net_worth > 1000000 || profile.income > 200000) {
        classification.investorCategory = 'ACCREDITED_INVESTOR'
        classification.documentationLevel = 'STANDARD'
      } else {
        classification.investorCategory = 'NON_ACCREDITED'
        classification.documentationLevel = 'BASIC'
      }
    } else if (profile.type === 'business') {
      if (profile.assets_under_management > 25000000) {
        classification.investorCategory = 'QUALIFIED_INSTITUTIONAL_BUYER'
        classification.documentationLevel = 'INSTITUTIONAL'
      } else if (profile.assets_under_management > 5000000) {
        classification.investorCategory = 'QUALIFIED_PURCHASER'
        classification.documentationLevel = 'ENHANCED'
      } else {
        classification.investorCategory = 'ACCREDITED_ENTITY'
        classification.documentationLevel = 'STANDARD'
      }
    }

    return classification
  }

  async getEligibleFunds(classification) {
    // Query fund eligibility based on investor classification
    const response = await fetch('/api/funds/eligible', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        investorCategory: classification.investorCategory,
        accreditationStatus: classification.accreditationStatus,
        investorType: classification.type
      })
    })

    return response.json()
  }

  getRequiredDocuments(classification) {
    const documentMap = {
      'QUALIFIED_PURCHASER': [
        'account_statement',
        'tax_return',
        'audited_financials',
        'legal_opinion_letter'
      ],
      'ACCREDITED_INVESTOR': [
        'tax_return',
        'bank_statement',
        'w2_form'
      ],
      'QUALIFIED_INSTITUTIONAL_BUYER': [
        'audited_financials',
        'form_adv',
        'certificate_of_incorporation',
        'investment_committee_resolution'
      ],
      'ACCREDITED_ENTITY': [
        'formation_documents',
        'bank_statement',
        'tax_return'
      ]
    }

    return documentMap[classification.investorCategory] || []
  }

  async verifyDocumentation(requiredDocs) {
    const documents = await this.parallel.getDocuments()
    const status = {
      complete: true,
      missing: [],
      expired: [],
      pending: []
    }

    for (const docType of requiredDocs) {
      const doc = documents.find(d => d.type === docType)

      if (!doc) {
        status.missing.push(docType)
        status.complete = false
      } else if (doc.status === 'pending') {
        status.pending.push(docType)
        status.complete = false
      } else if (this.isExpired(doc)) {
        status.expired.push(docType)
        status.complete = false
      }
    }

    return status
  }

  isExpired(document) {
    const expiryDate = new Date(document.expires_at)
    const today = new Date()
    const daysUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24)

    return daysUntilExpiry < 30 // Consider expired if less than 30 days
  }

  async createInvestorRecord(data) {
    // Store investor data in Blackstone's system
    const response = await fetch('/api/investors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        source: 'parallel_markets_sdk',
        compliance_check: await this.runComplianceCheck(data.profile)
      })
    })

    if (response.ok) {
      // Redirect to fund selection
      window.location.href = `/funds/select?eligible=${data.eligibleFunds.map(f => f.id).join(',')}`
    } else {
      // Handle error
      this.handleOnboardingError(response)
    }
  }

  async runComplianceCheck(profile) {
    // Implement AML/KYC checks
    const checks = {
      sanctions_screening: await this.checkSanctions(profile),
      pep_screening: await this.checkPEP(profile),
      adverse_media: await this.checkAdverseMedia(profile),
      identity_verification: profile.identity_status === 'verified'
    }

    return checks
  }
}

// Initialize onboarding flow
const onboarding = new BlackstoneInvestorOnboarding()
onboarding.initialize()
```

### Testing Procedures

```javascript
// Test Suite for PE Fund Onboarding
describe('Blackstone PE Fund Onboarding', () => {
  let onboarding

  beforeEach(() => {
    onboarding = new BlackstoneInvestorOnboarding()
  })

  test('Should classify HNW individual correctly', () => {
    const profile = {
      type: 'individual',
      net_worth: 10000000,
      income: 500000,
      accreditation_status: 'verified'
    }

    const classification = onboarding.classifyInvestor(profile)

    expect(classification.investorCategory).toBe('QUALIFIED_PURCHASER')
    expect(classification.documentationLevel).toBe('ENHANCED')
  })

  test('Should identify missing documents', async () => {
    const requiredDocs = ['tax_return', 'bank_statement', 'w2_form']
    const existingDocs = [
      { type: 'tax_return', status: 'verified' }
    ]

    // Mock getDocuments
    onboarding.parallel = {
      getDocuments: jest.fn().mockResolvedValue(existingDocs)
    }

    const status = await onboarding.verifyDocumentation(requiredDocs)

    expect(status.complete).toBe(false)
    expect(status.missing).toContain('bank_statement')
    expect(status.missing).toContain('w2_form')
  })

  test('Should handle expired documents', async () => {
    const requiredDocs = ['tax_return']
    const existingDocs = [
      {
        type: 'tax_return',
        status: 'verified',
        expires_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
      }
    ]

    onboarding.parallel = {
      getDocuments: jest.fn().mockResolvedValue(existingDocs)
    }

    const status = await onboarding.verifyDocumentation(requiredDocs)

    expect(status.complete).toBe(false)
    expect(status.expired).toContain('tax_return')
  })
})
```

### Success Metrics
- **Conversion Rate**: 85% of started applications completed
- **Time to Completion**: < 10 minutes average
- **Document Upload Success**: 95% first-time success
- **Accreditation Verification**: < 2 business days
- **Error Rate**: < 2% technical errors

---

## Case Study 2: Real Estate Investment Platform

### Business Context
**Client**: CrowdStreet Real Estate Platform
**Property Type**: Commercial real estate syndications
**Investment Range**: $25,000 - $1,000,000
**Regulatory**: Reg D 506(c) offerings requiring verified accreditation

### Requirements
1. Mandatory accreditation verification (506(c) compliance)
2. Support for self-directed IRAs
3. Joint investor accounts
4. SPV creation for certain investments
5. Geographic restrictions (state-level)

### Technical Implementation

```javascript
class RealEstateInvestmentPlatform {
  constructor() {
    this.config = {
      client_id: process.env.CROWDSTREET_PM_CLIENT_ID,
      environment: 'production',
      flow_type: 'overlay',
      scopes: ['profile', 'accreditation_status', 'identity', 'documents'],
      // Real estate specific configuration
      verification_required: true, // 506(c) requirement
      allow_joint_accounts: true,
      allow_ira_accounts: true
    }
  }

  async initializeInvestment(propertyId) {
    const property = await this.getPropertyDetails(propertyId)

    // Check if property requires accreditation
    if (property.offering_type === '506c') {
      const parallel = await loadParallel(this.config)

      // Force verification for 506(c)
      const verificationStatus = await this.verifyAccreditation(parallel)

      if (!verificationStatus.verified) {
        throw new Error('Accreditation verification required for this investment')
      }

      // Check geographic restrictions
      const profile = await parallel.getProfile()
      if (!this.checkGeographicEligibility(profile, property)) {
        throw new Error('Investment not available in your state')
      }

      // Handle account type selection
      const accountType = await this.selectAccountType(profile)

      // Process based on account type
      switch(accountType) {
        case 'INDIVIDUAL':
          return this.processIndividualInvestment(profile, property)
        case 'JOINT':
          return this.processJointInvestment(profile, property)
        case 'IRA':
          return this.processIRAInvestment(profile, property)
        case 'ENTITY':
          return this.processEntityInvestment(profile, property)
        default:
          throw new Error('Invalid account type')
      }
    }
  }

  async verifyAccreditation(parallel) {
    const status = await parallel.getAccreditationStatus()

    if (status.status !== 'verified') {
      // Trigger verification flow
      await parallel.startVerification({
        type: 'accreditation',
        method: 'third_party', // Use third-party verification for 506(c)
        documents_required: true
      })

      // Wait for verification completion
      return new Promise((resolve) => {
        parallel.subscribe('accreditation.verified', (result) => {
          resolve({ verified: true, details: result })
        })

        parallel.subscribe('accreditation.failed', (result) => {
          resolve({ verified: false, reason: result.reason })
        })
      })
    }

    return { verified: true, details: status }
  }

  checkGeographicEligibility(profile, property) {
    const restrictedStates = property.restricted_states || []
    const investorState = profile.address?.state

    if (restrictedStates.includes(investorState)) {
      return false
    }

    // Check if property has state-specific requirements
    const stateRequirements = property.state_requirements?.[investorState]
    if (stateRequirements) {
      return this.meetStateRequirements(profile, stateRequirements)
    }

    return true
  }

  meetStateRequirements(profile, requirements) {
    // Check state-specific requirements
    if (requirements.minimum_net_worth && profile.net_worth < requirements.minimum_net_worth) {
      return false
    }

    if (requirements.minimum_income && profile.income < requirements.minimum_income) {
      return false
    }

    if (requirements.experience_required && !profile.real_estate_experience) {
      return false
    }

    return true
  }

  async selectAccountType(profile) {
    // Implementation for account type selection UI
    return new Promise((resolve) => {
      this.showAccountTypeModal({
        options: this.getAvailableAccountTypes(profile),
        onSelect: (type) => resolve(type)
      })
    })
  }

  getAvailableAccountTypes(profile) {
    const types = ['INDIVIDUAL']

    if (profile.marital_status === 'married') {
      types.push('JOINT')
    }

    if (profile.has_ira) {
      types.push('IRA')
    }

    if (profile.type === 'business' || profile.has_entity) {
      types.push('ENTITY')
    }

    return types
  }

  async processJointInvestment(profile, property) {
    // Joint account requires both spouses' verification
    const jointAccountData = {
      primary_investor: profile,
      secondary_investor: null,
      ownership_type: 'joint_tenants', // or 'tenants_in_common'
      investment_split: { primary: 50, secondary: 50 }
    }

    // Trigger secondary investor verification
    const secondaryInvestor = await this.verifySecondaryInvestor()
    jointAccountData.secondary_investor = secondaryInvestor

    // Both must be accredited for 506(c)
    if (!secondaryInvestor.accreditation_status === 'verified') {
      throw new Error('Both investors must be accredited')
    }

    return this.createInvestment({
      property: property,
      account_type: 'JOINT',
      investors: [profile, secondaryInvestor],
      data: jointAccountData
    })
  }

  async processIRAInvestment(profile, property) {
    // IRA investments require custodian information
    const iraData = {
      custodian: await this.selectIRACustodian(),
      account_number: null,
      investment_direction_form: null
    }

    // Verify IRA custodian is approved
    if (!this.isApprovedCustodian(iraData.custodian)) {
      throw new Error('Please select an approved IRA custodian')
    }

    // Generate investment direction form
    iraData.investment_direction_form = await this.generateIRADirectionForm({
      investor: profile,
      property: property,
      custodian: iraData.custodian
    })

    return this.createInvestment({
      property: property,
      account_type: 'IRA',
      investor: profile,
      data: iraData
    })
  }

  async processEntityInvestment(profile, property) {
    // Entity investments require additional documentation
    const entityData = {
      entity_type: profile.entity_type,
      formation_state: profile.formation_state,
      ein: profile.ein,
      authorized_signers: [],
      required_documents: []
    }

    // Determine required entity documents
    entityData.required_documents = this.getEntityDocuments(entityData.entity_type)

    // Verify all signers
    for (const signer of profile.authorized_signers) {
      const verifiedSigner = await this.verifyAuthorizedSigner(signer)
      entityData.authorized_signers.push(verifiedSigner)
    }

    // Check if SPV creation is needed
    if (property.requires_spv || profile.requests_spv) {
      return this.createSPVInvestment(profile, property, entityData)
    }

    return this.createInvestment({
      property: property,
      account_type: 'ENTITY',
      investor: profile,
      data: entityData
    })
  }

  async createSPVInvestment(profile, property, entityData) {
    // Create Special Purpose Vehicle for investment
    const spvData = {
      name: `${property.name} SPV ${Date.now()}`,
      type: 'series_llc',
      state: 'Delaware',
      investors: [profile],
      property: property,
      management_fee: 0.02, // 2% management fee
      carried_interest: 0.20 // 20% carry
    }

    // Generate SPV documents
    const spvDocuments = await this.generateSPVDocuments(spvData)

    // Create SPV entity
    const spv = await this.createSPVEntity(spvData, spvDocuments)

    return {
      investment_vehicle: 'SPV',
      spv_id: spv.id,
      documents: spvDocuments,
      original_investor: profile,
      property: property
    }
  }
}

// Usage Example
const replatform = new RealEstateInvestmentPlatform()

// Handle property investment click
document.getElementById('invest-button').addEventListener('click', async (e) => {
  const propertyId = e.target.dataset.propertyId

  try {
    const investment = await replatform.initializeInvestment(propertyId)
    console.log('Investment created:', investment)

    // Redirect to funding page
    window.location.href = `/investments/${investment.id}/fund`
  } catch (error) {
    console.error('Investment failed:', error)
    showError(error.message)
  }
})
```

---

## Case Study 3: Multi-Entity Family Office

### Business Context
**Client**: Goldman Sachs Family Office Services
**Structure**: Multiple entities under single family office
**Entities**: Trusts, LLCs, Family partnerships, Foundations
**Assets**: $500M+ under management

### Requirements
1. Single sign-on for all entities
2. Entity-level access controls
3. Consolidated reporting across entities
4. Different accreditation levels per entity
5. Audit trail for all entity switches

### Technical Implementation

```javascript
class FamilyOfficePortal {
  constructor() {
    this.masterAccount = null
    this.entities = new Map()
    this.currentEntity = null
    this.auditLog = []
  }

  async initialize() {
    const config = {
      client_id: process.env.GOLDMAN_FO_CLIENT_ID,
      environment: 'production',
      flow_type: 'redirect',
      scopes: [
        'profile',
        'accreditation_status',
        'identity',
        'documents',
        'entities',
        'relationships'
      ],
      multi_entity: true,
      enable_sub_entities: true
    }

    const parallel = await loadParallel(config)

    // Get master account profile
    this.masterAccount = await parallel.getProfile()

    // Load all related entities
    await this.loadAllEntities(parallel)

    // Set up entity management UI
    this.setupEntityManagement()

    return this
  }

  async loadAllEntities(parallel) {
    const entities = await parallel.getEntities()

    for (const entity of entities) {
      const enrichedEntity = await this.enrichEntityData(entity, parallel)
      this.entities.set(entity.id, enrichedEntity)
    }

    // Create entity hierarchy
    this.buildEntityHierarchy()
  }

  async enrichEntityData(entity, parallel) {
    const enriched = {
      ...entity,
      accreditation: await parallel.getAccreditationStatus(entity.id),
      documents: await parallel.getDocuments(entity.id),
      investments: await this.getEntityInvestments(entity.id),
      authorized_users: await this.getAuthorizedUsers(entity.id),
      permissions: await this.getEntityPermissions(entity.id),
      tax_status: await this.getTaxStatus(entity.id)
    }

    // Classify entity type
    enriched.classification = this.classifyEntity(enriched)

    return enriched
  }

  classifyEntity(entity) {
    const classification = {
      type: entity.entity_type,
      tax_treatment: null,
      investment_restrictions: [],
      reporting_requirements: [],
      regulatory_status: null
    }

    switch(entity.entity_type) {
      case 'TRUST':
        classification.tax_treatment = entity.grantor_trust ? 'GRANTOR' : 'NON_GRANTOR'
        classification.investment_restrictions = this.getTrustRestrictions(entity)
        classification.reporting_requirements = ['1041', 'K-1']
        break

      case 'LLC':
        classification.tax_treatment = entity.tax_election || 'PARTNERSHIP'
        classification.investment_restrictions = this.getLLCRestrictions(entity)
        classification.reporting_requirements = ['1065', 'K-1']
        break

      case 'FOUNDATION':
        classification.tax_treatment = 'EXEMPT'
        classification.investment_restrictions = ['NO_JEOPARDY_INVESTMENTS', 'NO_EXCESS_BUSINESS_HOLDINGS']
        classification.reporting_requirements = ['990-PF']
        classification.regulatory_status = '501c3'
        break

      case 'FAMILY_PARTNERSHIP':
        classification.tax_treatment = 'PARTNERSHIP'
        classification.investment_restrictions = this.getPartnershipRestrictions(entity)
        classification.reporting_requirements = ['1065', 'K-1', 'FAMILY_AGREEMENT']
        break
    }

    return classification
  }

  buildEntityHierarchy() {
    // Create hierarchical structure of entities
    const hierarchy = {
      master: this.masterAccount,
      primary_entities: [],
      subsidiary_entities: new Map()
    }

    for (const [id, entity] of this.entities) {
      if (entity.parent_entity_id === null) {
        hierarchy.primary_entities.push(entity)
      } else {
        if (!hierarchy.subsidiary_entities.has(entity.parent_entity_id)) {
          hierarchy.subsidiary_entities.set(entity.parent_entity_id, [])
        }
        hierarchy.subsidiary_entities.get(entity.parent_entity_id).push(entity)
      }
    }

    this.hierarchy = hierarchy
    return hierarchy
  }

  setupEntityManagement() {
    // Create entity switcher UI
    const entitySwitcher = new EntitySwitcherComponent({
      entities: Array.from(this.entities.values()),
      hierarchy: this.hierarchy,
      onSwitch: (entityId) => this.switchEntity(entityId),
      onConsolidatedView: () => this.showConsolidatedView()
    })

    entitySwitcher.render('#entity-switcher-container')
  }

  async switchEntity(entityId) {
    const previousEntity = this.currentEntity
    const newEntity = this.entities.get(entityId)

    if (!newEntity) {
      throw new Error('Entity not found')
    }

    // Check permissions
    if (!this.hasEntityAccess(newEntity)) {
      throw new Error('Access denied to this entity')
    }

    // Log entity switch
    this.auditLog.push({
      action: 'ENTITY_SWITCH',
      from: previousEntity?.id,
      to: entityId,
      timestamp: new Date().toISOString(),
      user: this.masterAccount.id
    })

    // Update current entity
    this.currentEntity = newEntity

    // Update UI context
    await this.updateUIContext(newEntity)

    // Refresh available investments
    await this.refreshAvailableInvestments(newEntity)

    return newEntity
  }

  hasEntityAccess(entity) {
    // Check if current user has access to entity
    const user = this.masterAccount

    // Master account has access to all
    if (user.role === 'MASTER') {
      return true
    }

    // Check specific entity permissions
    return entity.authorized_users.includes(user.id)
  }

  async updateUIContext(entity) {
    // Update UI to reflect current entity context
    const context = {
      entity_name: entity.name,
      entity_type: entity.entity_type,
      accreditation_status: entity.accreditation.status,
      available_capital: await this.getAvailableCapital(entity.id),
      investment_restrictions: entity.classification.investment_restrictions,
      pending_investments: await this.getPendingInvestments(entity.id)
    }

    // Update UI elements
    document.getElementById('current-entity-name').textContent = context.entity_name
    document.getElementById('entity-type-badge').textContent = context.entity_type
    document.getElementById('available-capital').textContent = this.formatCurrency(context.available_capital)

    // Update investment filters based on restrictions
    this.applyInvestmentFilters(context.investment_restrictions)

    return context
  }

  async showConsolidatedView() {
    // Show consolidated view across all entities
    const consolidatedData = {
      total_aum: 0,
      total_investments: [],
      entity_breakdown: [],
      performance_metrics: {},
      tax_summary: {}
    }

    for (const [id, entity] of this.entities) {
      const entityMetrics = await this.getEntityMetrics(entity)

      consolidatedData.total_aum += entityMetrics.aum
      consolidatedData.total_investments.push(...entityMetrics.investments)
      consolidatedData.entity_breakdown.push({
        entity: entity.name,
        type: entity.entity_type,
        aum: entityMetrics.aum,
        performance: entityMetrics.performance
      })
    }

    // Generate consolidated report
    const report = await this.generateConsolidatedReport(consolidatedData)

    // Display report
    this.displayConsolidatedReport(report)

    return report
  }

  async getEntityMetrics(entity) {
    // Get comprehensive metrics for an entity
    const metrics = {
      aum: await this.getEntityAUM(entity.id),
      investments: await this.getEntityInvestments(entity.id),
      performance: await this.getEntityPerformance(entity.id),
      tax_liabilities: await this.getEntityTaxLiabilities(entity.id),
      compliance_status: await this.getComplianceStatus(entity.id)
    }

    return metrics
  }
}

// Entity Switcher Component
class EntitySwitcherComponent {
  constructor(options) {
    this.entities = options.entities
    this.hierarchy = options.hierarchy
    this.onSwitch = options.onSwitch
    this.onConsolidatedView = options.onConsolidatedView
  }

  render(selector) {
    const container = document.querySelector(selector)

    container.innerHTML = `
      <div class="entity-switcher">
        <div class="current-entity">
          <span class="entity-label">Current Entity:</span>
          <select id="entity-selector" class="entity-dropdown">
            ${this.renderEntityOptions()}
          </select>
        </div>
        <div class="entity-actions">
          <button id="consolidated-view-btn" class="btn-consolidated">
            Consolidated View
          </button>
          <button id="manage-entities-btn" class="btn-manage">
            Manage Entities
          </button>
        </div>
        <div class="entity-hierarchy">
          ${this.renderHierarchy()}
        </div>
      </div>
    `

    this.attachEventListeners()
  }

  renderEntityOptions() {
    return this.entities.map(entity => {
      const indent = entity.parent_entity_id ? '&nbsp;&nbsp;' : ''
      return `
        <option value="${entity.id}">
          ${indent}${entity.name} (${entity.entity_type})
        </option>
      `
    }).join('')
  }

  renderHierarchy() {
    // Render visual hierarchy of entities
    return `
      <div class="hierarchy-tree">
        ${this.renderHierarchyNode(this.hierarchy.primary_entities, this.hierarchy.subsidiary_entities)}
      </div>
    `
  }

  renderHierarchyNode(entities, subsidiaries, level = 0) {
    return entities.map(entity => {
      const subs = subsidiaries.get(entity.id) || []
      return `
        <div class="hierarchy-node" style="margin-left: ${level * 20}px">
          <span class="entity-node" data-entity-id="${entity.id}">
            ${entity.name} (${entity.entity_type})
          </span>
          ${subs.length > 0 ? this.renderHierarchyNode(subs, subsidiaries, level + 1) : ''}
        </div>
      `
    }).join('')
  }

  attachEventListeners() {
    document.getElementById('entity-selector').addEventListener('change', (e) => {
      this.onSwitch(e.target.value)
    })

    document.getElementById('consolidated-view-btn').addEventListener('click', () => {
      this.onConsolidatedView()
    })

    // Add click handlers for hierarchy nodes
    document.querySelectorAll('.entity-node').forEach(node => {
      node.addEventListener('click', (e) => {
        const entityId = e.target.dataset.entityId
        this.onSwitch(entityId)
        document.getElementById('entity-selector').value = entityId
      })
    })
  }
}
```

---

## Case Study 4: Institutional Allocator Portal

### Business Context
**Client**: CalPERS (California Public Employees' Retirement System)
**AUM**: $450+ billion
**Investment Types**: PE, VC, Real Estate, Infrastructure
**Compliance**: FOIA requirements, public disclosure

### Requirements
1. Institutional-grade security and compliance
2. Multi-user access with role-based permissions
3. Investment committee workflow integration
4. Public disclosure handling
5. ESG compliance verification

### Technical Implementation

```javascript
class InstitutionalAllocatorPortal {
  constructor() {
    this.config = {
      client_id: process.env.CALPERS_PM_CLIENT_ID,
      environment: 'production',
      flow_type: 'redirect',
      scopes: [
        'profile',
        'accreditation_status',
        'identity',
        'documents',
        'entities',
        'compliance',
        'esg_verification'
      ],
      security_level: 'institutional',
      mfa_required: true,
      session_timeout: 900000 // 15 minutes
    }

    this.committees = {
      INVESTMENT: 'investment_committee',
      RISK: 'risk_committee',
      ESG: 'esg_committee'
    }
  }

  async initializePortal() {
    // Multi-factor authentication required
    const mfaResult = await this.performMFA()

    if (!mfaResult.success) {
      throw new Error('MFA authentication failed')
    }

    // Initialize SDK with institutional config
    const parallel = await loadParallel(this.config)

    // Load institutional profile
    const profile = await parallel.getProfile()

    // Verify institutional status
    if (profile.type !== 'institutional') {
      throw new Error('Institutional access only')
    }

    // Set up role-based access
    const userRole = await this.getUserRole(profile)
    const permissions = this.getPermissionsByRole(userRole)

    // Initialize dashboard with permissions
    this.initializeDashboard(profile, permissions)

    return { profile, permissions, parallel }
  }

  async performMFA() {
    // Implement institutional MFA
    return new Promise((resolve) => {
      const mfaModal = new MFAModal({
        methods: ['hardware_token', 'biometric', 'sms'],
        onSuccess: (token) => resolve({ success: true, token }),
        onFailure: (error) => resolve({ success: false, error })
      })

      mfaModal.show()
    })
  }

  getUserRole(profile) {
    // Determine user role from profile
    const roleMap = {
      'chief_investment_officer': 'CIO',
      'portfolio_manager': 'PM',
      'analyst': 'ANALYST',
      'compliance_officer': 'COMPLIANCE',
      'board_member': 'BOARD'
    }

    return roleMap[profile.title] || 'VIEWER'
  }

  getPermissionsByRole(role) {
    const permissions = {
      CIO: ['view_all', 'approve_investments', 'modify_allocations', 'access_confidential'],
      PM: ['view_portfolio', 'propose_investments', 'modify_own_allocations'],
      ANALYST: ['view_public', 'create_reports', 'propose_investments'],
      COMPLIANCE: ['view_all', 'audit_access', 'compliance_override'],
      BOARD: ['view_all', 'final_approval'],
      VIEWER: ['view_public']
    }

    return permissions[role] || permissions.VIEWER
  }

  async initializeDashboard(profile, permissions) {
    const dashboard = new InstitutionalDashboard({
      profile,
      permissions,
      committees: this.committees,
      onInvestmentProposal: (proposal) => this.handleInvestmentProposal(proposal),
      onComplianceReview: (investment) => this.performComplianceReview(investment),
      onESGAssessment: (investment) => this.performESGAssessment(investment)
    })

    await dashboard.render()
  }

  async handleInvestmentProposal(proposal) {
    // Investment committee workflow
    const workflow = {
      id: this.generateWorkflowId(),
      proposal,
      status: 'INITIATED',
      stages: [
        { name: 'INITIAL_REVIEW', status: 'PENDING', assignee: 'analyst_team' },
        { name: 'DUE_DILIGENCE', status: 'NOT_STARTED', assignee: 'dd_team' },
        { name: 'RISK_ASSESSMENT', status: 'NOT_STARTED', assignee: 'risk_committee' },
        { name: 'ESG_REVIEW', status: 'NOT_STARTED', assignee: 'esg_committee' },
        { name: 'INVESTMENT_COMMITTEE', status: 'NOT_STARTED', assignee: 'ic' },
        { name: 'BOARD_APPROVAL', status: 'NOT_STARTED', assignee: 'board' }
      ],
      created_at: new Date().toISOString(),
      public_disclosure: await this.preparePublicDisclosure(proposal)
    }

    // Start workflow
    await this.startWorkflow(workflow)

    return workflow
  }

  async startWorkflow(workflow) {
    // Process each stage sequentially
    for (const stage of workflow.stages) {
      stage.status = 'IN_PROGRESS'

      const result = await this.processWorkflowStage(stage, workflow)

      if (result.approved) {
        stage.status = 'COMPLETED'
        stage.completed_at = new Date().toISOString()
        stage.approver = result.approver
        stage.comments = result.comments
      } else {
        stage.status = 'REJECTED'
        workflow.status = 'REJECTED'
        workflow.rejection_reason = result.reason
        break
      }
    }

    if (workflow.stages.every(s => s.status === 'COMPLETED')) {
      workflow.status = 'APPROVED'
      await this.executeInvestment(workflow)
    }

    // Update public records
    await this.updatePublicRecords(workflow)

    return workflow
  }

  async processWorkflowStage(stage, workflow) {
    switch(stage.name) {
      case 'INITIAL_REVIEW':
        return this.performInitialReview(workflow.proposal)

      case 'DUE_DILIGENCE':
        return this.performDueDiligence(workflow.proposal)

      case 'RISK_ASSESSMENT':
        return this.performRiskAssessment(workflow.proposal)

      case 'ESG_REVIEW':
        return this.performESGReview(workflow.proposal)

      case 'INVESTMENT_COMMITTEE':
        return this.getICApproval(workflow)

      case 'BOARD_APPROVAL':
        return this.getBoardApproval(workflow)

      default:
        throw new Error(`Unknown workflow stage: ${stage.name}`)
    }
  }

  async performComplianceReview(investment) {
    const compliance = {
      regulatory_check: await this.checkRegulatoryCompliance(investment),
      conflict_of_interest: await this.checkConflicts(investment),
      concentration_limits: await this.checkConcentrationLimits(investment),
      prohibited_investments: await this.checkProhibitedList(investment),
      public_disclosure_requirements: await this.checkDisclosureRequirements(investment)
    }

    compliance.overall_status = Object.values(compliance).every(c => c.passed) ? 'PASSED' : 'FAILED'

    return compliance
  }

  async performESGAssessment(investment) {
    const esg = {
      environmental_score: await this.assessEnvironmental(investment),
      social_score: await this.assessSocial(investment),
      governance_score: await this.assessGovernance(investment),
      controversy_check: await this.checkControversies(investment),
      carbon_footprint: await this.calculateCarbonFootprint(investment),
      diversity_metrics: await this.assessDiversity(investment)
    }

    esg.composite_score = this.calculateESGScore(esg)
    esg.meets_criteria = esg.composite_score >= 70 // Minimum 70/100 score

    return esg
  }

  async preparePublicDisclosure(proposal) {
    // Prepare FOIA-compliant disclosure
    const disclosure = {
      investment_name: proposal.name,
      asset_class: proposal.asset_class,
      proposed_commitment: proposal.amount,
      expected_return: 'CONFIDENTIAL', // Redacted
      fees: {
        management_fee: proposal.fees.management,
        carried_interest: proposal.fees.carry
      },
      investment_period: proposal.period,
      key_risks: this.sanitizeRisks(proposal.risks)
    }

    return disclosure
  }

  sanitizeRisks(risks) {
    // Remove confidential information from risks
    return risks.map(risk => ({
      category: risk.category,
      severity: risk.severity,
      description: risk.public_description || 'REDACTED'
    }))
  }
}

// Institutional Dashboard Component
class InstitutionalDashboard {
  constructor(options) {
    this.profile = options.profile
    this.permissions = options.permissions
    this.committees = options.committees
  }

  async render() {
    const container = document.getElementById('institutional-dashboard')

    container.innerHTML = `
      <div class="dashboard-header">
        <h1>${this.profile.organization_name}</h1>
        <div class="user-info">
          ${this.profile.name} (${this.profile.title})
        </div>
      </div>

      <div class="dashboard-nav">
        ${this.renderNavigation()}
      </div>

      <div class="dashboard-content">
        <div class="portfolio-overview">
          ${await this.renderPortfolioOverview()}
        </div>

        <div class="pending-workflows">
          ${await this.renderPendingWorkflows()}
        </div>

        <div class="compliance-alerts">
          ${await this.renderComplianceAlerts()}
        </div>
      </div>
    `
  }

  renderNavigation() {
    const navItems = []

    if (this.permissions.includes('view_all')) {
      navItems.push('<a href="#portfolio">Portfolio</a>')
    }

    if (this.permissions.includes('approve_investments')) {
      navItems.push('<a href="#approvals">Pending Approvals</a>')
    }

    if (this.permissions.includes('compliance_override')) {
      navItems.push('<a href="#compliance">Compliance</a>')
    }

    return navItems.join(' | ')
  }
}
```

---

## Case Study 5: Secondary Market Trading Platform

### Business Context
**Client**: Forge Global Secondary Market
**Market**: Private company shares
**Volume**: $3B+ annual transaction volume
**Complexity**: Transfer restrictions, ROFR, regulatory compliance

### Technical Implementation

```javascript
class SecondaryMarketPlatform {
  async initiateTrade(listing) {
    const buyer = await this.verifyBuyer()
    const seller = await this.verifySeller(listing)

    // Check transfer restrictions
    const restrictions = await this.checkTransferRestrictions(listing)

    if (restrictions.rofr) {
      await this.handleROFR(listing, buyer, seller)
    }

    // Create SPV for transaction
    const spv = await this.createTransactionSPV(listing, buyer)

    // Execute trade
    return this.executeTrade(spv, listing, buyer, seller)
  }

  async checkTransferRestrictions(listing) {
    const company = await this.getCompanyDetails(listing.company_id)

    return {
      rofr: company.has_rofr,
      lockup_period: company.lockup_end_date,
      blackout_periods: company.blackout_periods,
      minimum_lot_size: company.minimum_lot_size,
      qualified_purchaser_required: company.qp_required,
      transfer_agent_approval: company.transfer_agent_required
    }
  }
}
```

---

## Case Study 6: Feeder Fund Structure

### Business Context
**Client**: Apollo Global Management
**Structure**: Master-Feeder with multiple feeders
**Complexity**: Different investor classes, jurisdictions, fee structures

### Technical Implementation

```javascript
class FeederFundStructure {
  async setupFeederFund(masterFund, jurisdiction) {
    const feeder = {
      master_fund: masterFund,
      jurisdiction: jurisdiction,
      entity_type: this.getOptimalEntityType(jurisdiction),
      investor_classes: await this.defineInvestorClasses(jurisdiction),
      fee_structure: await this.calculateFeeStructure(masterFund, jurisdiction)
    }

    // Set up investor onboarding for specific feeder
    const onboarding = await this.initializeFeederOnboarding(feeder)

    return { feeder, onboarding }
  }

  getOptimalEntityType(jurisdiction) {
    const entityMap = {
      'Cayman Islands': 'Exempted Limited Partnership',
      'Luxembourg': 'SCSp',
      'Ireland': 'ICAV',
      'Delaware': 'Limited Partnership',
      'Singapore': 'VCC'
    }

    return entityMap[jurisdiction] || 'Limited Partnership'
  }
}
```

---

## Case Study 7: International Investor Compliance

### Business Context
**Client**: Carlyle Group International
**Jurisdictions**: 50+ countries
**Requirements**: FATCA, CRS, local regulations

### Technical Implementation

```javascript
class InternationalCompliance {
  async onboardInternationalInvestor(profile) {
    const jurisdiction = profile.tax_residence

    // Check sanctions
    const sanctionsCheck = await this.checkSanctions(profile, jurisdiction)
    if (sanctionsCheck.blocked) {
      throw new Error('Investor blocked by sanctions')
    }

    // FATCA/CRS requirements
    const taxCompliance = await this.handleTaxCompliance(profile, jurisdiction)

    // Local regulatory requirements
    const localRequirements = await this.checkLocalRequirements(jurisdiction)

    // Documentation requirements
    const requiredDocs = this.getInternationalDocuments(jurisdiction, profile.type)

    return {
      investor: profile,
      jurisdiction,
      compliance: {
        sanctions: sanctionsCheck,
        tax: taxCompliance,
        local: localRequirements,
        documents: requiredDocs
      }
    }
  }

  async handleTaxCompliance(profile, jurisdiction) {
    const compliance = {
      fatca: null,
      crs: null,
      local_tax: null
    }

    // FATCA for US-related investors
    if (this.hasFATCARequirement(profile, jurisdiction)) {
      compliance.fatca = await this.processFATCA(profile)
    }

    // CRS for participating jurisdictions
    if (this.hasCRSRequirement(jurisdiction)) {
      compliance.crs = await this.processCRS(profile)
    }

    // Local tax requirements
    compliance.local_tax = await this.processLocalTax(profile, jurisdiction)

    return compliance
  }

  getInternationalDocuments(jurisdiction, investorType) {
    const baseDocuments = [
      'passport',
      'proof_of_address',
      'source_of_funds',
      'bank_reference_letter'
    ]

    const jurisdictionSpecific = {
      'China': ['foreign_exchange_approval'],
      'India': ['pan_card', 'liberalized_remittance_certificate'],
      'Switzerland': ['form_a_declaration'],
      'Germany': ['tax_certificate'],
      'Japan': ['resident_certificate']
    }

    const documents = [...baseDocuments]

    if (jurisdictionSpecific[jurisdiction]) {
      documents.push(...jurisdictionSpecific[jurisdiction])
    }

    if (investorType === 'entity') {
      documents.push(
        'certificate_of_incorporation',
        'authorized_signatories',
        'beneficial_ownership_declaration'
      )
    }

    return documents
  }
}
```

---

## Case Study 8: Automated Reaccreditation Workflow

### Business Context
**Client**: KKR Wealth Management Platform
**Challenge**: Annual reaccreditation for 10,000+ investors
**Goal**: 95% automated reaccreditation rate

### Technical Implementation

```javascript
class AutomatedReaccreditation {
  async initiateBulkReaccreditation() {
    const investorsNeedingReaccreditation = await this.getExpiringAccreditations()

    const results = {
      total: investorsNeedingReaccreditation.length,
      automated: 0,
      manual_review: 0,
      failed: 0
    }

    for (const investor of investorsNeedingReaccreditation) {
      const result = await this.processReaccreditation(investor)

      if (result.automated) {
        results.automated++
      } else if (result.requires_review) {
        results.manual_review++
      } else {
        results.failed++
      }
    }

    return results
  }

  async processReaccreditation(investor) {
    // Check if eligible for automated reaccreditation
    if (await this.eligibleForAutomation(investor)) {
      return this.automatedReaccreditation(investor)
    }

    // Fall back to manual process
    return this.manualReaccreditation(investor)
  }

  async eligibleForAutomation(investor) {
    const criteria = {
      previous_verification: investor.last_verification_method === 'third_party',
      no_material_changes: await this.checkMaterialChanges(investor),
      consistent_income: await this.verifyConsistentIncome(investor),
      active_account: investor.last_activity < 90, // days
      good_standing: investor.compliance_issues === 0
    }

    return Object.values(criteria).every(c => c === true)
  }

  async automatedReaccreditation(investor) {
    // Pull latest financial data
    const financialData = await this.pullFinancialData(investor)

    // Run automated verification
    const verification = await this.runAutomatedVerification(financialData)

    if (verification.success) {
      // Update accreditation
      await this.updateAccreditation(investor, verification)

      // Send confirmation
      await this.sendConfirmation(investor, verification)

      return { automated: true, investor, verification }
    }

    return { automated: false, requires_review: true, investor }
  }
}
```

---

## Testing Scenarios & Edge Cases

### Scenario Testing Matrix

```javascript
const testScenarios = [
  {
    name: 'Expired Accreditation During Investment',
    setup: async () => {
      // Create investor with expiring accreditation
      const investor = await createTestInvestor({
        accreditation_expires: Date.now() + 1000 * 60 * 5 // 5 minutes
      })
      return investor
    },
    test: async (investor) => {
      // Start investment process
      const investment = await startInvestment(investor)

      // Wait for expiration
      await sleep(6 * 60 * 1000)

      // Attempt to complete investment
      const result = await completeInvestment(investment)

      expect(result.error).toBe('ACCREDITATION_EXPIRED')
    }
  },
  {
    name: 'Joint Account Divorce Scenario',
    setup: async () => {
      const jointAccount = await createJointAccount(investor1, investor2)
      return jointAccount
    },
    test: async (account) => {
      // Simulate divorce proceedings
      await updateAccountStatus(account, 'DIVORCE_PENDING')

      // Attempt investment
      const result = await attemptInvestment(account)

      expect(result.blocked).toBe(true)
      expect(result.reason).toBe('JOINT_ACCOUNT_RESTRICTED')
    }
  },
  {
    name: 'Network Failure During SDK Load',
    test: async () => {
      // Simulate network failure
      mockNetworkFailure()

      const result = await loadParallel(config)

      expect(result).toBe(null)
      expect(fallbackUI.visible).toBe(true)
    }
  },
  {
    name: 'Concurrent Entity Switches',
    test: async () => {
      const promises = []

      // Attempt 10 concurrent entity switches
      for (let i = 0; i < 10; i++) {
        promises.push(switchEntity(entities[i % entities.length]))
      }

      const results = await Promise.allSettled(promises)

      // Only one should succeed
      const successful = results.filter(r => r.status === 'fulfilled')
      expect(successful.length).toBe(1)
    }
  }
]
```

---

## Performance Testing Scenarios

### Load Testing Configuration

```javascript
// K6 Performance Test Script
import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  scenarios: {
    // Simulate normal daily load
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '5m', target: 0 }
      ]
    },
    // Simulate peak load (market open)
    peak_load: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 500,
      stages: [
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 0 }
      ]
    },
    // Stress test
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 400 },
        { duration: '5m', target: 400 },
        { duration: '2m', target: 600 },
        { duration: '5m', target: 600 },
        { duration: '10m', target: 0 }
      ]
    }
  },
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests under 1.5s
    errors: ['rate<0.1'] // Error rate under 10%
  }
}

export default function() {
  // Test SDK initialization
  const initResponse = http.post(
    'https://api.parallelmarkets.com/sdk/init',
    JSON.stringify({ client_id: __ENV.CLIENT_ID }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(initResponse, {
    'SDK initialized': (r) => r.status === 200,
    'Response time OK': (r) => r.timings.duration < 1000
  })

  errorRate.add(initResponse.status !== 200)

  sleep(1)

  // Test authentication flow
  const authResponse = http.post(
    'https://api.parallelmarkets.com/oauth/authorize',
    JSON.stringify({
      client_id: __ENV.CLIENT_ID,
      scope: 'profile accreditation_status'
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(authResponse, {
    'Auth successful': (r) => r.status === 200,
    'Token received': (r) => JSON.parse(r.body).access_token !== undefined
  })

  sleep(1)
}
```

---

## Compliance & Regulatory Scenarios

### Regulatory Testing Matrix

| Scenario | Regulation | Test Case | Expected Outcome |
|----------|------------|-----------|------------------|
| US Accredited Investor | SEC Rule 501 | Income > $200k | Accredited |
| EU Professional Client | MiFID II | €500k portfolio | Professional Status |
| UK High Net Worth | FCA COBS 4.12 | £250k income | Certified HNWI |
| Singapore Accredited | SFA Section 4A | S$2M net assets | Accredited |
| Hong Kong Professional | SFO Schedule 1 | HK$8M portfolio | Professional Investor |
| Swiss Qualified | CISA Art. 10 | CHF 2M assets | Qualified Investor |
| Canadian Accredited | NI 45-106 | C$1M financial assets | Accredited |
| Australian Sophisticated | Corps Act s708 | A$2.5M assets | Sophisticated |

### Compliance Test Implementation

```javascript
class ComplianceTestSuite {
  async runRegulatoryTests() {
    const testResults = []

    for (const jurisdiction of this.jurisdictions) {
      const result = await this.testJurisdictionCompliance(jurisdiction)
      testResults.push(result)
    }

    return this.generateComplianceReport(testResults)
  }

  async testJurisdictionCompliance(jurisdiction) {
    const tests = {
      investor_classification: await this.testInvestorClassification(jurisdiction),
      documentation_requirements: await this.testDocumentation(jurisdiction),
      investment_restrictions: await this.testRestrictions(jurisdiction),
      reporting_obligations: await this.testReporting(jurisdiction),
      cross_border_rules: await this.testCrossBorder(jurisdiction)
    }

    return {
      jurisdiction,
      tests,
      compliant: Object.values(tests).every(t => t.passed)
    }
  }
}
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Obtain sandbox credentials from Parallel Markets
- [ ] Review API documentation
- [ ] Set up development environment
- [ ] Configure test data

### Development Phase
- [ ] Implement basic SDK integration
- [ ] Add error handling
- [ ] Implement retry logic
- [ ] Add monitoring/logging
- [ ] Create test suites

### Testing Phase
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Load testing
- [ ] Security testing
- [ ] UAT with sample investors

### Deployment
- [ ] Production credentials
- [ ] SSL certificates
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Monitoring setup

### Post-Deployment
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Compliance reporting
- [ ] Regular audits
- [ ] Documentation updates

---

## Success Metrics Dashboard

```javascript
class SuccessMetricsDashboard {
  constructor() {
    this.metrics = {
      conversion: {
        started: 0,
        completed: 0,
        rate: 0
      },
      performance: {
        sdk_load_time: [],
        auth_completion_time: [],
        api_response_time: []
      },
      errors: {
        total: 0,
        by_type: {}
      },
      compliance: {
        verifications_completed: 0,
        documents_uploaded: 0,
        rejections: 0
      }
    }
  }

  trackConversion(event) {
    if (event.type === 'START') {
      this.metrics.conversion.started++
    } else if (event.type === 'COMPLETE') {
      this.metrics.conversion.completed++
    }

    this.metrics.conversion.rate =
      (this.metrics.conversion.completed / this.metrics.conversion.started) * 100
  }

  generateReport() {
    return {
      conversion_rate: this.metrics.conversion.rate + '%',
      avg_sdk_load_time: this.average(this.metrics.performance.sdk_load_time) + 'ms',
      avg_auth_time: this.average(this.metrics.performance.auth_completion_time) + 's',
      error_rate: (this.metrics.errors.total / this.metrics.conversion.started) * 100 + '%',
      verification_success_rate:
        ((this.metrics.compliance.verifications_completed /
          (this.metrics.compliance.verifications_completed + this.metrics.compliance.rejections)) * 100) + '%'
    }
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length
  }
}
```

---

## Conclusion

This comprehensive use case document provides iCapital Solutions Engineers with:

1. **8 Detailed Case Studies** covering major investment scenarios
2. **Complete Implementation Code** for each use case
3. **Testing Procedures** including edge cases and performance tests
4. **Compliance Matrices** for international regulations
5. **Success Metrics** to track implementation effectiveness

Each case study can be used as a template for actual client implementations, with code that can be adapted to specific requirements. The testing scenarios ensure robust implementation, while the compliance section ensures regulatory adherence across jurisdictions.

Practice implementing these use cases in your sandbox environment to build expertise with the Parallel Markets SDK and be prepared to support any client scenario at iCapital.

---

*Document Version: 1.0*
*Last Updated: October 2024*
*Maintained by: iCapital Identity Solutions Team*
*Classification: Internal Use Only*