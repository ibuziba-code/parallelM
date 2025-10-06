# Changelog

## v2.1.2 (2024-10-10)

### Fixed

- The `OAuthErrorCode` TypeScript type now includes a previously missing value 'access_denied'

### Enhancements

- Some previously unexported TypeScript types are now exported

## v2.1.1 (2024-05-02)

### Fixed

- A bug was fixed in our React package to ensure `getProfile` remains a function (#25)

## v2.1.0 (2024-04-26)

### Changed

- Updated types to ensure consistency with all supported options (#23). Some types (ProfileAPIResponse / IndividualProfile / BusinessProfile) are
  now exported from @parallelmarkets/vanilla instead of @parallelmarkets/react

### Enhancements

- Upgraded to pnpm 9 (#20)

## v2.0.1 (2024-03-07)

### Enhancements

- Update Vanilla SDK to pass library context to the Parallel JS for logging/debugging purposes

## v2.0.0 (2023-10-06)

- Updates Vanilla SDK to use V2 API.

### Enhancements

- Documentation updated with improved samples.
- Sample JavaScript app updated and improved.

## v0.0.4 (2022-10-31)

### Enhancements

- Minor documentation fixes (#7)
