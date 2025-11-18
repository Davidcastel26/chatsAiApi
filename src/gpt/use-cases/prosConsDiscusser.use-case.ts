import OpenAI from 'openai';

interface Options {
  prompt: string;
}

export const prosConsDiscusserUseCase = async (
  openai: OpenAI,
  { prompt }: Options,
) => {
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: `
            A question will be provided to you, your task is to response with the pros and the cons,
            The answer must be in Markdown format,
            and the pros and cons must be in a list
        `,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_output_tokens: 300,
  });

  const first = response.output[0];

  if (first?.type === 'message') {
    const firstBlock = first.content[0];

    if (firstBlock?.type === 'output_text') {
      console.log(firstBlock.text);
      return firstBlock;
    }
  }

  // return response.output[0];
};
