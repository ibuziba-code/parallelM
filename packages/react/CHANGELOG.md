# Changelog

## v2.1.2 (2024-10-10)

### Changed

- Update dependency @parallelmarkets/vanilla to version 2.1.2

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

- Update React library SDK to pass library context to the Parallel JS for logging/debugging purposes

## v2.0.0 (2023-10-06)

- Updates APIs to use [Case Management APIs](https://developer.parallelmarkets.com/docs/server/case-management-api/introduction).

### Enhancements

- Documentation updated with improved samples.
- Sample JavaScript app updated and improved.

### Removed

- Functions for getting Accreditation / Identity information directly (you should rely on server integrations for this information going forward)

## v0.0.7 (2022-11-01)

### Enhancements

- Add explicit peer support for React ^18.0.0 (#8)
- Remove test files from published package (#8)

## v0.0.6 (2022-10-31)

### Enhancements

- Minor documentation fixes (#7)
- Added the `getBlockchain` function for the new Blockchain API (#7)
