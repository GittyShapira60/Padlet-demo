describe('Public padlet sharing', () => {
  const ts = Date.now();
  const ownerName = `owner${ts}`;
  const visitorName = `visitor${ts}`;
  const password = 'Pass@123';
  const padletTitle = `לוח משותף ${ts}`;
  let padletUrl: string;

  before(() => {
    cy.register(ownerName, password);
    cy.login(ownerName, password);
    cy.contains('צור לוח').click();
    cy.get('input[placeholder="לוח הרעיונות שלי..."]').clear().type(padletTitle);
    cy.contains('button', 'צור לוח').click();
    cy.contains(padletTitle).click();
    cy.url().then((url) => { padletUrl = url; });
    cy.get('button[aria-label="אפשרויות"]').click();
    cy.contains('שיתוף').click();
    cy.contains('select', 'אין גישה').select('מגיב');
    cy.register(visitorName, password);
  });

  it('visitor can access a padlet via its public link after setting permission', () => {
    cy.login(visitorName, password);
    cy.visit(padletUrl);
    cy.contains(padletTitle).should('be.visible');
  });

  it('redirects to the padlet after login when accessing link while logged out', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit(padletUrl);
    cy.url().should('include', '/login');
    cy.contains('button', 'כניסה').click();
    cy.get('#username').type(visitorName);
    cy.get('input[type="password"]').type(password);
    cy.contains('button[type="submit"]', 'כניסה').click();
    cy.url().should('include', '/padlets/');
    cy.contains(padletTitle).should('be.visible');
  });
});
