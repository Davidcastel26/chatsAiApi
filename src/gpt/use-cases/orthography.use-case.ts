import OpenAI from 'openai';

interface Options {
  prompt: string;
}

export interface OrthoResult {
  userScore: number;
  errors: string[];
  message: string;
  fullText: string;
}

export const orthographyUseCase = async (openai: OpenAI, options: Options) => {
  const { prompt } = options;

  const response = await openai.responses.create({
    model: 'gpt-4o-mini',
    input: [
      {
        role: 'system',
        content: `You are an orthography corrector. 
        You have to return a response in JSON fromat, and your task are going to be:
        Correct grammar, spelling, and punctuation. 
        The words use should exist into Oxford English Dictionary or Society for the Diffusion of English.
        In case there is no erros you can congrats the user.
        Out put exa:
        {
          userScore: number,
          errors: string[], ['error -> solution']
          message: string, // Use emojis and text to congrats the user
          fullText: all the text corrected
        }
        `,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_output_tokens: 150,
  });

  const rawText = response.output_text ?? '{}';
  const jsonResp = JSON.parse(rawText) as OrthoResult;

  return jsonResp;
};
