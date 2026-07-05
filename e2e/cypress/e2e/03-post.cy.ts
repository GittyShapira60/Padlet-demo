describe('Post management', () => {
  const ts = Date.now();
  const username = `postuser${ts}`;
  const password = 'Pass@123';
  const padletTitle = `לוח פוסטים ${ts}`;
  const postTitle = `פוסט למחיקה ${ts}`;

  before(() => {
    cy.register(username, password);
    cy.login(username, password);
    cy.contains('צור לוח').click();
    cy.get('input[placeholder="לוח הרעיונות שלי..."]').clear().type(padletTitle);
    cy.contains('button', 'צור לוח').click();
    cy.contains(padletTitle).click();
    cy.get('button[aria-label="הוסף פוסט"]').click();
    cy.contains('button', 'טקסט').click();
    cy.get('input[placeholder*="כותרת"]').type(postTitle);
    cy.contains('button', 'שמור').click();
    cy.contains(postTitle).should('be.visible');
  });

  beforeEach(() => {
    cy.login(username, password);
    cy.contains(padletTitle).click();
  });

  it('opens the three-dots menu on a post', () => {
    cy.contains(postTitle)
      .closest('article')
      .find('.padlet-post-actions button')
      .click();
    cy.contains('עריכה').should('be.visible');
    cy.contains('מחיקה').should('be.visible');
  });

  it('deletes a post via the three-dots menu', () => {
    cy.contains(postTitle)
      .closest('article')
      .find('.padlet-post-actions button')
      .click();
    cy.contains('מחיקה').click();
    cy.contains(postTitle).should('not.exist');
  });
});
