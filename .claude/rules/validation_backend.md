---
paths:
  - 'backend/**'
  - 'src/routes/**'
  - 'src/controllers/**'
---

# Rules: minimal backend validation

- **Type and presence checks:** Rely on simple JavaScript type checking (`typeof`, checking for empty trimmed strings) rather than heavy validation libraries (like Zod, Joi, or express-validator) for this study scope.
- **Early return pattern:** Validate incoming request bodies at the top of the route/controller and return a `400 Bad Request` immediately if validation fails.

<br>

## Example: validating a POST request

```typescript
// req.body validation before processing
const { title, summary, body } = req.body ?? {};

if (
	typeof title !== 'string' ||
	title.trim() === '' ||
	typeof summary !== 'string' ||
	summary.trim() === '' ||
	typeof body !== 'string' ||
	body.trim() === ''
) {
	res
		.status(400)
		.json({ error: 'Title, summary and body must be non-empty strings' });
	return;
}
```
