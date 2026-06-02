const id = "67905f1f0a5ef30e5d5daeb7"; // need a valid id
fetch('http://localhost:5037/api/CreditCards')
  .then(r => r.json())
  .then(cards => {
    const card = cards[0];
    console.log("Original Requirement:", card.requirement);
    card.requirement = "Test Requirement 123";
    return fetch('http://localhost:5037/api/CreditCards/' + card.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card)
    }).then(r => {
      console.log("Update status:", r.status);
      return fetch('http://localhost:5037/api/CreditCards/' + card.id).then(r => r.json());
    });
  })
  .then(updatedCard => {
    console.log("Updated Requirement:", updatedCard.requirement);
  })
  .catch(console.error);
