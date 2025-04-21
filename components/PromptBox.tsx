import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useState } from 'react'

interface PromptBoxProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<{ role: string; content: string }[]>>; //ไว้ลบ
}

const PromptBox: React.FC<PromptBoxProps> = ({ setIsLoading, isLoading , setMessages}) => {

    const [prompt, setPrompt] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true); // เริ่ม loading

    setMessages(prev => [...prev, { role: 'user', content: prompt }]); //ไว้ลบ
    setPrompt('');
    setIsLoading(false);

    try {
      // ตัวอย่างเรียก API หรือทำงาน async
      await new Promise((resolve) => setTimeout(resolve, 1500)); // mock delay

      console.log('Prompt submitted:', prompt);
      setPrompt('');
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setIsLoading(false); // หยุด loading ไม่ว่าจะสำเร็จหรือ error
    }
  };

    return (
        <form onSubmit={handleSubmit} className={`w-full ${false ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
            <textarea className='outline-none w-full resize-none overflow-hidden break-words bg-transparent' rows={2}
            placeholder='Message DeepSeek' required
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt} />

            <div className={`flex items-center justify-between text-sm`}>
                <div className={`flex items-center gap-2`}>
                    <p className={`flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition`}>
                        <Image className={`h-5`} src={assets.deepthink_icon} alt='' />
                        DeepThink (R1)
                    </p>

                    <p className={`flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition`}>
                        <Image className={`h-5`} src={assets.search_icon} alt='' />
                        Search
                    </p>
                </div>

                <div className={`flex items-center gap-2`}>
                    <Image className={`w-4 cursor-pointer`} src={assets.pin_icon} alt='' />
                    <button type="submit" disabled={!prompt || isLoading} className={`${prompt && !isLoading ? "bg-primary cursor-pointer" : "bg-[#71717a] cursor-not-allowed"} rounded-full p-2`}>
                        <Image className={`w-3.5 aspect-square`} src={prompt && !isLoading ? assets.arrow_icon : assets.arrow_icon_dull} alt='' />
                    </button>
                </div>

            </div>
        </form>
    )
    }

export default PromptBox
