import { assets } from '@/assets/assets';
import Image from 'next/image';
import React from 'react'; 

interface ChatLabelProps {
  openMenu: {
    id: number;
    open: boolean;
  };
  setOpenMenu: React.Dispatch<React.SetStateAction<{ id: number; open: boolean }>>;
  id: number; // เพิ่ม prop เพื่อใช้กำหนดว่า label นี้เป็นของ chat ไหน
}

const ChatLabel: React.FC<ChatLabelProps> = ({ openMenu, setOpenMenu ,id}) => {
   const handleClick = () => {
    setOpenMenu((prev) => ({
      id,
      open: prev.id === id ? !prev.open : true,
    }));
  };

  return (
    <div onClick={handleClick} className={`flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer`}>
      <p className={`group-hover:max-w-5/6 truncate`}>Chat Name Here</p>
      <div className={`group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg`}>
        <Image src={assets.three_dots} alt='' className={`w-4 ${openMenu.open ? '' : 'hidden'} group-hover:block`} />
        <div className={`absolute ${openMenu.open ? 'block' : 'hidden'} -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 z-10`}> {/* Added z-index */}
          <div className={`flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg`}>
            <Image src={assets.pencil_icon} alt='' className={`w-4`} />
            <p>Rename</p>
          </div>
          <div className={`flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg`}>
            <Image src={assets.delete_icon} alt='' className={`w-4`} />
            <p>Delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatLabel;
