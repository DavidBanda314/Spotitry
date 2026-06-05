
import { db } from './utils/constants'

export async function createAndFetchUser(userId,name,email){
  try{
      const ref = db.ref('users/' + userId )
      await ref.set({
        userId: userId,
        username: name,
        email: email,
      });
  }
  catch(error){
    console.log(error)
  }
  }
  export async function fetchUser(userId){

    try{
      let snapshot = await db.ref('users/' + userId).get();
      const data = snapshot.exists();
      if(data){
        return snapshot.val()
      }
      else{
        return null
      }
    }
    catch(error){
      console.log(error)
    }
  }

function sanitizeKey(key){
  return String(key).replace(/[.#$/[\]]/g, '_').trim() || 'unknown'
}

export async function saveTimestamp(userId,song,progress_ms,note){
  try{
      const ref = db.ref('users/' + userId + `/timestamps/${sanitizeKey(song.name)}`)
      const data = {
        position_ms:progress_ms,
        song:song
      };
      if (note) {
        data.note = note;
      }
      await ref.push(data);
  }
  catch(error){
    console.log(error)
  }
}
export async function getTimestamps(userId){
  try{
    let snapshot = await db.ref('users/' + userId + '/timestamps').get();
    const data = snapshot.exists();
    console.log(data)
  }
  catch(error){
    console.log(error)
  }
}

export async function setProfilePublic(userId, isPublic) {
  try {
    await db.ref('users/' + userId + '/isPublic').set(isPublic);
    if (!isPublic) {
      await db.ref('users/' + userId + '/publicProfile').remove();
    }
  } catch (error) {
    console.log(error);
  }
}

export async function updatePublicProfile(userId, profileData) {
  try {
    await db.ref('users/' + userId + '/publicProfile').set(profileData);
  } catch (error) {
    console.log(error);
  }
}

export async function fetchPublicProfile(userId) {
  try {
    const isPublicSnap = await db.ref('users/' + userId + '/isPublic').get();
    if (isPublicSnap.exists() && isPublicSnap.val()) {
      const profileSnap = await db.ref('users/' + userId + '/publicProfile').get();
      return { isPublic: true, publicProfile: profileSnap.exists() ? profileSnap.val() : null };
    }
    return { isPublic: false };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getIsPublic(userId) {
  try {
    const snapshot = await db.ref('users/' + userId + '/isPublic').get();
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}