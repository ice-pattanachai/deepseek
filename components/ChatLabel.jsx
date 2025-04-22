import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import { set } from 'mongoose';
import Image from 'next/image';
import React from 'react'; 
import toast from 'react-hot-toast';

const ChatLabel= ({ openMenu, setOpenMenu , id , name }) => {

  const { fetchUsersChats , chats , setSelectedChat } = useAppContext()

  const selectChat = () => {
    const chatData = chats.find(chat => chat.id === id)
    setSelectedChat(chatData)
    console.log("🚀 ~ selectChat ~ chatData:", chatData)
  }

  const renameHandler = async () => {
    try {
      const newName = prompt('Enter new name')
      if (!newName) return
      const {data} = await axios.post('api/chat/rename' , {chatId: id , name: newName})
      if (data.success) {
        fetchUsersChats()
        setOpenMenu({open: false})
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteHandler = async () => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this chat?')
      if (!confirm) return
      const {data} = await axios.post('api/chat/delete' , {chatId: id})
      if (data.success) {
        fetchUsersChats()
        setOpenMenu({id: 0 , open: false})
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }

  return (
    <div onClick={selectChat}
    className={`flex items-center justify-between p-2 text-white/80 hover:bg-white/10 rounded-lg text-sm group cursor-pointer`}>
      <p className={`group-hover:max-w-5/6 truncate`}>{name}</p>
      <div onClick={e => {e.stopPropagation() ; setOpenMenu({id: id , open: !openMenu.open})}}
      className={`group relative flex items-center justify-center h-6 w-6 aspect-square hover:bg-black/80 rounded-lg`}>
        <Image src={assets.three_dots} alt='' className={`w-4 ${openMenu.id === id && openMenu.open ? '' : 'hidden'} group-hover:block`} />
        <div className={`absolute ${openMenu.id === id && openMenu.open ? 'block' : 'hidden'} -right-36 top-6 bg-gray-700 rounded-xl w-max p-2 z-10`}> {/* Added z-index */}
          <div onClick={renameHandler}
          className={`flex items-center gap-3 hover:bg-white/10 px-3 py-2 rounded-lg`}>
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
