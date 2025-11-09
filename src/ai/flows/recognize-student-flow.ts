
'use server';
/**
 * @fileOverview An AI flow to recognize a student from a photo.
 *
 * - recognizeStudent - A function that handles the student recognition process.
 * - RecognizeStudentInput - The input type for the recognizeStudent function.
 * - RecognizeStudentOutput - The return type for the recognizeStudent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentProfileSchema = z.object({
  id: z.string().describe('The unique ID of the student.'),
  name: z.string().describe('The name of the student.'),
  photoUrl: z.string().describe('A public URL to the student\'s profile photo.'),
});

const RecognizeStudentInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the student to recognize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  students: z
    .array(StudentProfileSchema)
    .describe('A list of all students in the class with their profile photos.'),
});
type RecognizeStudentInput = z.infer<typeof RecognizeStudentInputSchema>;

const RecognizeStudentOutputSchema = z.object({
  studentId: z.string().nullable().describe('The ID of the recognized student, or null if no match is found.'),
});
type RecognizeStudentOutput = z.infer<typeof RecognizeStudentOutputSchema>;

export async function recognizeStudent(input: RecognizeStudentInput): Promise<RecognizeStudentOutput> {
  return recognizeStudentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeStudentPrompt',
  input: { schema: RecognizeStudentInputSchema },
  output: { schema: RecognizeStudentOutputSchema },
  prompt: `You are an expert at facial recognition. Your task is to identify a student from a provided photo.

You will be given a primary photo of the student to be identified. You will also be given a list of all students in the class, including their name, ID, and a URL to their profile photo.

Compare the primary photo with each student's profile photo. If you find a confident match, return the ID of that student in the 'studentId' field.

If you are not confident about the match or if the person in the photo does not match any student, return null for the 'studentId'.

Primary Photo to Identify:
{{media url=photoDataUri}}

List of students in the class:
{{#each students}}
- Student ID: {{id}}
- Name: {{name}}
- Profile Photo: {{media url=photoUrl}}
---
{{/each}}
`,
});

const recognizeStudentFlow = ai.defineFlow(
  {
    name: 'recognizeStudentFlow',
    inputSchema: RecognizeStudentInputSchema,
    outputSchema: RecognizeStudentOutputSchema,
  },
  async (input) => {
    // Use a more capable model for multi-image comparison
    const visionModel = ai.model('googleai/gemini-pro-vision');
    const { output } = await visionModel.generate({
      prompt: await prompt.render({ input }),
      output: {
        format: 'json',
        schema: RecognizeStudentOutputSchema,
      },
    });

    return output ?? { studentId: null };
  }
);
