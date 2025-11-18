import OpenAI from 'openai';

interface Options {
  prompt: string;
  lang: string;
}

export const translateTextUseCase = async (
  openai: OpenAI,
  { prompt, lang }: Options,
) => {
  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: `Translate the following text to the language ${lang}: ${prompt} 
        `,
      },
    ],
    temperature: 0.2,
    max_output_tokens: 100,
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
