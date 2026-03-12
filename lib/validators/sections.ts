export interface SectionInput {
  title: string;
  description?: string;
}

export function validateSectionInput(input: SectionInput): SectionInput {
  const title = input.title.trim();
  if (title.length < 2) {
    throw new Error("List name must be at least 2 characters.");
  }
  if (title.length > 80) {
    throw new Error("List name must be at most 80 characters.");
  }

  const description = input.description?.trim() || undefined;
  if (description && description.length > 300) {
    throw new Error("Description must be at most 300 characters.");
  }

  return { title, description };
}
