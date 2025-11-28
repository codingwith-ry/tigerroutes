describe('Deliberate CI failure', () => {
  test('Deliberate failing test to demonstrate CI failure', () => {
    // This assertion is intentionally wrong so CI reports a failure you can screenshot.
    expect(false).toBe(true);
  });
});
