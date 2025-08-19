require('dotenv').config();
// Queue Tests

test('Empty queue fetch returns null', () => {
	return fetch(`${process.env.BASE_URL}/queue/get`)
		.then(result => result.json())
		.then(data => {
			expect(data).toBe(null)
		})
 })
