import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRef, useEffect } from 'react'
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import { app } from '../firebase'
import {Link} from "react-router-dom";
import { updateUserStart,updateUserSuccess,updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure,signOutUserSuccess } from '../redux/user/userSlice'

export default function profile() {
  const fileRef = useRef(null)
  const {currentUser ,loading, error} = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined)
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setListingsError] = useState(false);
  const [userListings,setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app)
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage,fileName)
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress))
        },
      (error) => {
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((DownloadURL) => {
          setFormData({...formData, avatar: DownloadURL});
        })
      }
    );
  }

  const handleChange = (e) =>{
    setFormData({...formData,[e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async() =>{
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`,{method: 'POST',});
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleShowListings = async() =>{
    try {
      setListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setListingsError(true);
    }
  }

  const handleSignOut = async() =>{
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if(data.success === false){
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
    }
  }

  const handleListingDelete = async(listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method: 'POST',
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4 ml-5 mr-5'>
        <input type='file' onChange={(e)=>setFile(e.target.files[0])} ref={fileRef} hidden accept='image/*'></input>
        <img onClick={()=>fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt='profile' className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'> {fileUploadError ? 
        (<span className='text-red-700'>Error Uploading Image</span>) :
        filePerc>0 && filePerc<100 ?
        (<span className='text-green-700'>{`uploading : ${filePerc} %`}</span>):
        filePerc ===100 ? ( <span className='text-green-700'>Upload Complete</span>) : ""
        } </p>
        <input type='text' id='username' placeholder='user name' className='border p-3 rounded-lg' defaultValue={currentUser.username} onChange={handleChange}/>
        <input type='text' id='email' placeholder='email' className='border p-3 rounded-lg' defaultValue={currentUser.email} onChange={handleChange} />
        <input type='password' id='password' placeholder='password' className='border p-3 rounded-lg' onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={handleSubmit}>{loading?  'Loading...': 'Update'}</button>
        <Link to={'/create-listing'}>
          <span className='flex flex-col bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95 items-center'>Create Listing</span>
        </Link>
      </form>
      <div className='flex justify-between m-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-700 m-5'>{error? error : ''}</p>
      <p className='text-green-700 m-5'>{updateSuccess? 'Update Successful' : ''}</p>
      <button onClick={handleShowListings} className='text-green-700 w-full'>Show Listings</button>
      <p>{showListingsError ?  'Error Showing Listings' : ''}</p>
      {userListings && userListings.length > 0 && 
      <div className='flex flex-col gap-4'>
        <h1 className='text-center mt-7 text-2xl'>Your Listings</h1>
      {userListings.map((listing) => (
        <div key={listing._id} className='border rounded-lg p-3 gap-4 flex justify-between items-center'>
          <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt='listing cover' className='h-32 w-36 object-contain rounded-lg' />
          </Link>
          <Link className='text-slate-700 flex-1 font-semibold hover:underline truncate' to={`/listing/${listing._id}`}>
            <p >{listing.name}</p>
          </Link>
          <div className='flex flex-col items-center'>
            <button className='text-red-700 uppercase' onClick={()=>handleListingDelete(listing._id)}>Delete</button>
            <button className='text-green-700 uppercase'>Edit</button>
          </div>
        </div>
      ) ) 
    }</div>}
    </div>
  )
}
