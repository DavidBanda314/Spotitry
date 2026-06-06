
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

export async function saveTimestamp(userId,song,progress_ms,note,member){
  try{
      const songKey = sanitizeKey(song.name)
      const ref = db.ref('users/' + userId + `/timestamps/${songKey}`)
      const data = {
        position_ms:progress_ms,
        song:song
      };
      if (note) {
        data.note = note;
      }
      if (member && member.memberId) {
        data.memberId = member.memberId;
        data.memberName = member.name || '';
        data.memberColor = member.color || '';
      }
      const newRef = await ref.push(data);
      return { songKey, pushId: newRef.key }
  }
  catch(error){
    console.log(error)
    return null
  }
}

// Assign (or clear) which band member a saved moment belongs to.
// Pass member = { memberId, name, color } to set, or null/undefined to clear.
export async function setTimestampMember(userId, songKey, pushId, member) {
  try {
    const base = 'users/' + userId + '/timestamps/' + songKey + '/' + pushId;
    if (member && member.memberId) {
      await db.ref(base + '/memberId').set(member.memberId);
      await db.ref(base + '/memberName').set(member.name || '');
      await db.ref(base + '/memberColor').set(member.color || '');
    } else {
      await db.ref(base + '/memberId').remove();
      await db.ref(base + '/memberName').remove();
      await db.ref(base + '/memberColor').remove();
    }
  } catch (error) {
    console.log(error);
  }
}
export async function updateTimestampNote(userId, songKey, pushId, note) {
  try {
    const ref = db.ref('users/' + userId + '/timestamps/' + songKey + '/' + pushId + '/note');
    if (note && note.trim()) {
      await ref.set(note.trim());
    } else {
      await ref.remove();
    }
  } catch (error) {
    console.log(error);
  }
}
export async function deleteTimestamp(userId, songKey, pushId) {
  try {
    const tsRef = db.ref('users/' + userId + '/timestamps/' + songKey + '/' + pushId);
    await tsRef.remove();
    // If no timestamps remain under this song, clean up the song group
    const songRef = db.ref('users/' + userId + '/timestamps/' + songKey);
    const snapshot = await songRef.get();
    if (!snapshot.exists() || !snapshot.val()) {
      await songRef.remove();
    }
  } catch (error) {
    console.log(error);
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

export async function createCollection(userId, name) {
  try {
    const ref = db.ref('users/' + userId + '/collections');
    const newRef = await ref.push({ name });
    return newRef.key;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function addTimestampToCollection(userId, collectionId, timestampData) {
  try {
    const ref = db.ref('users/' + userId + '/collections/' + collectionId + '/timestamps');
    await ref.push(timestampData);
  } catch (error) {
    console.log(error);
  }
}

export async function removeTimestampFromCollection(userId, collectionId, timestampKey) {
  try {
    const ref = db.ref('users/' + userId + '/collections/' + collectionId + '/timestamps/' + timestampKey);
    await ref.remove();
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCollection(userId, collectionId) {
  try {
    const ref = db.ref('users/' + userId + '/collections/' + collectionId);
    await ref.remove();
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCollections(userId) {
  try {
    const snapshot = await db.ref('users/' + userId + '/collections').get();
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

// --- Band member rosters ---------------------------------------------------
// A roster is defined once per band (keyed by the Spotify artist id that is
// already stored on every saved song) and reused across all that band's songs.

function membersBase(userId, artistId) {
  return 'users/' + userId + '/artistMembers/' + sanitizeKey(artistId);
}

export async function getArtistMembers(userId, artistId) {
  try {
    const snapshot = await db.ref(membersBase(userId, artistId)).get();
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.log(error);
    return {};
  }
}

export async function addArtistMember(userId, artistId, member, artistName) {
  try {
    const base = db.ref(membersBase(userId, artistId));
    if (artistName) {
      await base.child('artistName').set(artistName);
    }
    const newRef = await base.child('members').push({
      name: (member && member.name) || '',
      color: (member && member.color) || '',
    });
    return newRef.key;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateArtistMember(userId, artistId, memberId, member) {
  try {
    const ref = db.ref(membersBase(userId, artistId) + '/members/' + memberId);
    await ref.update({
      name: (member && member.name) || '',
      color: (member && member.color) || '',
    });
  } catch (error) {
    console.log(error);
  }
}

export async function deleteArtistMember(userId, artistId, memberId) {
  try {
    const ref = db.ref(membersBase(userId, artistId) + '/members/' + memberId);
    await ref.remove();
  } catch (error) {
    console.log(error);
  }
}