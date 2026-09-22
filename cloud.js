/* ============================================================
   BEFORE THE CLOSE — v1.1 CLOUD DEV
   Supabase Auth + cloud sync. Local storage remains offline-first.
   Browser-safe publishable key only. NEVER use a secret/service-role key here.
============================================================ */
(() => {
  "use strict";

  const SUPABASE_URL = "https://yficdwsclnukrdobmxfw.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FvLb2iX5rg0_IfEJVVXcOw_hbmZbIU2";
  const MIGRATION_KEY = "btcCloudMigrationV1";
  const SYNC_KEYS = new Set([
    "favorites","userName","salesType","firstName","name","industry","selectedIndustry","userIndustry",
    "btcJourneyStats","btcDailyCheckins","btcPrayerHistory","btcWeeklyFocus","btcOnboardingComplete",
    "btcDailyReminder","btcMilestones","btcAchievementUnlocks","btcReflections","streak","lastVisit"
  ]);

  let client = null;
  let currentUser = null;
  let applyingCloud = false;
  let syncTimer = null;
  let authMode = "signup";

  function el(id){ return document.getElementById(id); }
  function safeJSON(key, fallback){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch(_) { return fallback; } }
  function dateKey(d=new Date()){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function weekStart(){ const d=new Date(); const day=d.getDay(); d.setDate(d.getDate()-(day===0?6:day-1)); return dateKey(d); }
  function hashText(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
  function prayerKey(item){ return [item.industry||"general",item.mode||item.type||"prayer",hashText((item.title||"")+"|"+(item.text||item.prayer_text||""))].join(":"); }
  function status(message, kind="") { const n=el("btcCloudStatus"); if(n){ n.textContent=message; n.className="btc-cloud-status "+kind; } }
  function authMessage(message, kind="") { const n=el("btcAuthMessage"); if(n){ n.textContent=message; n.className="btc-auth-message "+kind; } }
  function refreshLocalUI(){
    try { if(typeof loadSettings==="function") loadSettings(); } catch(_){}
    try { if(typeof updateWelcome==="function") updateWelcome(); } catch(_){}
    try { if(typeof renderDailyCheckin==="function") renderDailyCheckin(); } catch(_){}
    try { if(typeof displayFavorites==="function") displayFavorites(); } catch(_){}
    try { if(typeof renderWeeklyFocus==="function") renderWeeklyFocus(); } catch(_){}
    try { if(typeof renderReminderSettings==="function") renderReminderSettings(); } catch(_){}
    try { if(typeof btcRenderReflection==="function") btcRenderReflection(); } catch(_){}
    try { if(typeof renderJourney==="function") renderJourney(); } catch(_){}
  }

  function renderAccount(){
    const out=el("btcSignedOutActions"), inn=el("btcSignedInActions"), email=el("btcAccountEmail"), copy=el("btcAccountCopy");
    if(!out || !inn) return;
    out.hidden=!!currentUser; inn.hidden=!currentUser;
    if(currentUser){
      if(email) email.textContent=currentUser.email||"Your account";
      if(copy) copy.textContent="Your Journey is protected locally and synced to your account when you're online.";
    } else {
      if(copy) copy.textContent="Sign in to back up your Journey and carry it across devices.";
    }
  }

  window.btcOpenAuth = function(mode="signup"){
    authMode=mode;
    const modal=el("btcAuthModal"); if(!modal) return;
    const title=el("btcAuthTitle"), sub=el("btcAuthSubtitle"), submit=el("btcAuthSubmit"), nameWrap=el("btcAuthNameWrap"), passWrap=el("btcAuthPasswordWrap"), newWrap=el("btcAuthNewPasswordWrap"), forgot=el("btcForgotPassword"), sw=el("btcAuthSwitch");
    authMessage("");
    if(mode==="signup"){
      title.textContent="Create your account"; sub.textContent="Back up your Journey and keep it with you."; submit.textContent="Create Account";
      nameWrap.hidden=false; passWrap.hidden=false; newWrap.hidden=true; forgot.hidden=true; sw.hidden=false; sw.textContent="Already have an account? Sign in"; sw.onclick=()=>btcOpenAuth("signin");
      const localName=localStorage.getItem("userName")||localStorage.getItem("firstName")||""; if(el("btcAuthName")) el("btcAuthName").value=localName;
    } else if(mode==="signin"){
      title.textContent="Welcome back"; sub.textContent="Sign in and bring your Journey with you."; submit.textContent="Sign In";
      nameWrap.hidden=true; passWrap.hidden=false; newWrap.hidden=true; forgot.hidden=false; sw.hidden=false; sw.textContent="New here? Create an account"; sw.onclick=()=>btcOpenAuth("signup");
    } else if(mode==="recovery"){
      title.textContent="Reset your password"; sub.textContent="We'll email you a secure recovery link."; submit.textContent="Send Reset Email";
      nameWrap.hidden=true; passWrap.hidden=true; newWrap.hidden=true; forgot.hidden=true; sw.hidden=false; sw.textContent="Back to sign in"; sw.onclick=()=>btcOpenAuth("signin");
    } else if(mode==="newpassword"){
      title.textContent="Choose a new password"; sub.textContent="Enter a new password for your account."; submit.textContent="Update Password";
      nameWrap.hidden=true; passWrap.hidden=true; newWrap.hidden=false; forgot.hidden=true; sw.hidden=true;
    }
    modal.hidden=false; document.body.style.overflow="hidden";
  };
  window.btcCloseAuth = function(){ const m=el("btcAuthModal"); if(m)m.hidden=true; document.body.style.overflow=""; authMessage(""); };

  window.btcSubmitAuth = async function(){
    if(!client) return authMessage("Cloud connection isn't ready. Refresh and try again.","error");
    const email=(el("btcAuthEmail")?.value||"").trim();
    const password=el("btcAuthPassword")?.value||"";
    const btn=el("btcAuthSubmit"); if(btn) btn.disabled=true;
    authMessage("Working…");
    try {
      if(authMode==="signup"){
        const name=(el("btcAuthName")?.value||"").trim();
        if(!email) throw new Error("Enter your email address.");
        if(password.length<8) throw new Error("Use a password with at least 8 characters.");
        const {data,error}=await client.auth.signUp({email,password,options:{data:{first_name:name},emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        if(data.session){ authMessage("Account created. Syncing your Journey…","success"); setTimeout(()=>btcCloseAuth(),650); }
        else authMessage("Account created. Check your email to confirm it, then come back and sign in.","success");
      } else if(authMode==="signin"){
        if(!email) throw new Error("Enter your email address.");
        const {data,error}=await client.auth.signInWithPassword({email,password}); if(error) throw error;
        currentUser=data?.user||data?.session?.user||currentUser;
        renderAccount();
        authMessage("Signed in. Bringing your Journey with you…","success");
        btcCloseAuth();
        if(currentUser) setTimeout(()=>syncAll(false),0);
      } else if(authMode==="recovery"){
        if(!email) throw new Error("Enter your email address.");
        const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}); if(error) throw error;
        authMessage("Reset email sent. Open the link in that email to choose a new password.","success");
      } else if(authMode==="newpassword"){
        const np=el("btcAuthNewPassword")?.value||""; if(np.length<8) throw new Error("Use at least 8 characters.");
        const {error}=await client.auth.updateUser({password:np}); if(error) throw error;
        authMessage("Password updated. You're signed in.","success"); setTimeout(()=>btcCloseAuth(),900);
      }
    } catch(err){ authMessage(err?.message||"Something went wrong. Try again.","error"); }
    finally { if(btn) btn.disabled=false; }
  };

  window.btcSignOut = async function(){ if(!client)return; await client.auth.signOut(); currentUser=null; renderAccount(); status("Signed out. Your local Journey stays on this device."); };

  async function pullCloud(){
    const uid=currentUser.id;
    const [profile,checkins,refs,favs,goal,hist,ach,stats,prefs]=await Promise.all([
      client.from("profiles").select("*").eq("id",uid).maybeSingle(),
      client.from("daily_checkins").select("checkin_date,mood").eq("user_id",uid),
      client.from("reflections").select("reflection_date,mood,note").eq("user_id",uid),
      client.from("favorites").select("prayer_key,title,prayer_text,prayer_type,industry,created_at").eq("user_id",uid),
      client.from("weekly_goals").select("*").eq("user_id",uid).eq("week_start",weekStart()).maybeSingle(),
      client.from("prayer_history").select("prayer_key,title,prayer_text,prayer_type,industry,opened_at").eq("user_id",uid).order("opened_at",{ascending:false}).limit(20),
      client.from("user_achievements").select("achievement_key").eq("user_id",uid),
      client.from("user_stats").select("*").eq("user_id",uid).maybeSingle(),
      client.from("notification_preferences").select("*").eq("user_id",uid).maybeSingle()
    ]);
    const firstError=[profile,checkins,refs,favs,goal,hist,ach,stats,prefs].find(x=>x.error)?.error; if(firstError) throw firstError;
    applyingCloud=true;
    try {
      const p=profile.data;
      if(p){
        const localName=localStorage.getItem("userName")||localStorage.getItem("firstName")||"";
        if(!localName && p.first_name){ localStorage.setItem("userName",p.first_name); localStorage.setItem("firstName",p.first_name); }
        if(!localStorage.getItem("salesType") && p.industry) localStorage.setItem("salesType",p.industry);
        if(p.onboarding_complete) localStorage.setItem("btcOnboardingComplete","true");
      }
      const localC=safeJSON("btcDailyCheckins",{}); (checkins.data||[]).forEach(x=>{ if(!localC[x.checkin_date]) localC[x.checkin_date]=x.mood; }); localStorage.setItem("btcDailyCheckins",JSON.stringify(localC));
      const localR=safeJSON("btcReflections",{}); (refs.data||[]).forEach(x=>{ if(!localR[x.reflection_date]) localR[x.reflection_date]={mood:x.mood||"",note:x.note||""}; }); localStorage.setItem("btcReflections",JSON.stringify(localR));
      const localF=safeJSON("favorites",[]); const mergedF=[...localF]; (favs.data||[]).forEach(x=>{ if(!mergedF.some(y=>prayerKey(y)===x.prayer_key)) mergedF.push({title:x.title,text:x.prayer_text,industry:x.industry||"general",mode:x.prayer_type||"daily"}); }); localStorage.setItem("favorites",JSON.stringify(mergedF));
      if(!safeJSON("btcWeeklyFocus",null) && goal.data){ const g=goal.data; localStorage.setItem("btcWeeklyFocus",JSON.stringify({weekKey:g.week_start,type:g.custom_goal_name||g.goal_type,target:g.target,progress:g.progress,intention:g.intention||""})); }
      const localH=safeJSON("btcPrayerHistory",[]); const mergedH=[...localH]; (hist.data||[]).forEach(x=>{ if(!mergedH.some(y=>(y.title||"")===x.title&&(y.text||"")===x.prayer_text)) mergedH.push({title:x.title,text:x.prayer_text,type:x.prayer_type||"Prayer",time:x.opened_at}); }); localStorage.setItem("btcPrayerHistory",JSON.stringify(mergedH.slice(0,20)));
      const localA=safeJSON("btcAchievementUnlocks",[]); const mergedA=[...new Set([...localA,...(ach.data||[]).map(x=>x.achievement_key)])]; localStorage.setItem("btcAchievementUnlocks",JSON.stringify(mergedA));
      if(stats.data){
        const js=safeJSON("btcJourneyStats",{prayersOpened:0}); js.prayersOpened=Math.max(js.prayersOpened||0,stats.data.prayers_opened||0); localStorage.setItem("btcJourneyStats",JSON.stringify(js));
        const ms=safeJSON("btcMilestones",{shares:0,goalsCompleted:0,bestStreak:0}); ms.shares=Math.max(ms.shares||0,stats.data.prayers_shared||0); ms.goalsCompleted=Math.max(ms.goalsCompleted||0,stats.data.goals_completed||0); ms.bestStreak=Math.max(ms.bestStreak||0,stats.data.best_streak||0); localStorage.setItem("btcMilestones",JSON.stringify(ms));
      }
      if(prefs.data && !localStorage.getItem("btcDailyReminder")){ localStorage.setItem("btcDailyReminder",JSON.stringify({enabled:!!prefs.data.daily_reminder_enabled,time:(prefs.data.reminder_time||"08:00").slice(0,5),lastSent:""})); }
    } finally { applyingCloud=false; }
  }

  async function pushCloud(){
    const uid=currentUser.id;
    const name=localStorage.getItem("userName")||localStorage.getItem("firstName")||"";
    const industry=localStorage.getItem("salesType")||localStorage.getItem("industry")||"general";
    const onboarding=localStorage.getItem("btcOnboardingComplete")==="true";
    let r=await client.from("profiles").upsert({id:uid,first_name:name||null,industry,onboarding_complete:onboarding},{onConflict:"id"}); if(r.error)throw r.error;

    const checkins=safeJSON("btcDailyCheckins",{}); const checkRows=Object.entries(checkins).map(([d,m])=>({user_id:uid,checkin_date:d,mood:m})); if(checkRows.length){ r=await client.from("daily_checkins").upsert(checkRows,{onConflict:"user_id,checkin_date"}); if(r.error)throw r.error; }
    const refs=safeJSON("btcReflections",{}); const refRows=Object.entries(refs).filter(([,v])=>v&&v.mood).map(([d,v])=>({user_id:uid,reflection_date:d,mood:v.mood,note:(v.note||"").slice(0,180)})); if(refRows.length){ r=await client.from("reflections").upsert(refRows,{onConflict:"user_id,reflection_date"}); if(r.error)throw r.error; }

    const favs=safeJSON("favorites",[]); if(Array.isArray(favs)){ const rows=favs.filter(x=>x&&x.text).map(x=>({user_id:uid,prayer_key:prayerKey(x),title:x.title||"Saved Prayer",prayer_text:x.text,prayer_type:x.mode||x.type||null,industry:x.industry||null})); r=await client.from("favorites").delete().eq("user_id",uid); if(r.error)throw r.error; if(rows.length){r=await client.from("favorites").insert(rows);if(r.error)throw r.error;} }

    const focus=safeJSON("btcWeeklyFocus",null); if(focus&&focus.weekKey){ const standard=["Appointments","Closes","Doors Knocked","Calls","Follow-Ups","Demos","Quotes"]; const completed=(focus.progress||0)>=(focus.target||1); r=await client.from("weekly_goals").upsert({user_id:uid,week_start:focus.weekKey,goal_type:standard.includes(focus.type)?focus.type:"Custom",custom_goal_name:standard.includes(focus.type)?null:focus.type,target:focus.target,progress:focus.progress||0,intention:focus.intention||null,completed,completed_at:completed?new Date().toISOString():null},{onConflict:"user_id,week_start"}); if(r.error)throw r.error; }

    const hist=safeJSON("btcPrayerHistory",[]); r=await client.from("prayer_history").delete().eq("user_id",uid); if(r.error)throw r.error; if(Array.isArray(hist)&&hist.length){ const rows=hist.slice(0,20).filter(x=>x&&x.text).map((x,i)=>({user_id:uid,prayer_key:prayerKey(x),title:x.title||"Prayer",prayer_text:x.text,prayer_type:x.type||null,industry:x.industry||null,opened_at:x.time||x.openedAt||new Date(Date.now()-i*1000).toISOString()})); if(rows.length){r=await client.from("prayer_history").insert(rows);if(r.error)throw r.error;} }

    const unlocks=safeJSON("btcAchievementUnlocks",[]); if(Array.isArray(unlocks)&&unlocks.length){ const rows=unlocks.map(k=>({user_id:uid,achievement_key:k})); r=await client.from("user_achievements").upsert(rows,{onConflict:"user_id,achievement_key"}); if(r.error)throw r.error; }
    const js=safeJSON("btcJourneyStats",{prayersOpened:0}), ms=safeJSON("btcMilestones",{shares:0,goalsCompleted:0,bestStreak:0});
    r=await client.from("user_stats").upsert({user_id:uid,prayers_opened:js.prayersOpened||0,prayers_shared:ms.shares||0,goals_completed:ms.goalsCompleted||0,current_streak:parseInt(localStorage.getItem("streak")||"0",10)||0,best_streak:ms.bestStreak||0},{onConflict:"user_id"}); if(r.error)throw r.error;
    const rem=safeJSON("btcDailyReminder",{enabled:false,time:"08:00"}); r=await client.from("notification_preferences").upsert({user_id:uid,daily_reminder_enabled:!!rem.enabled,reminder_time:(rem.time||"08:00")+":00",timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||null},{onConflict:"user_id"}); if(r.error)throw r.error;
  }

  async function syncAll(manual=false){
    if(!currentUser || !navigator.onLine) { if(manual) status("Offline. Your changes are safe locally and will sync when you're back online."); return; }
    status("Syncing…","syncing");
    try {
      const migrated=localStorage.getItem(MIGRATION_KEY)===currentUser.id;
      if(!migrated){ await pullCloud(); await pushCloud(); localStorage.setItem(MIGRATION_KEY,currentUser.id); refreshLocalUI(); }
      else { await pushCloud(); }
      status("Synced • "+new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}));
    } catch(err){ console.error("Before the Close cloud sync:",err); status("Sync issue — your data is still safe on this device.","error"); }
  }
  window.btcSyncNow=(manual=true)=>syncAll(manual);

  function scheduleSync(){ if(applyingCloud||!currentUser)return; clearTimeout(syncTimer); syncTimer=setTimeout(()=>syncAll(false),900); }
  const nativeSet=Storage.prototype.setItem, nativeRemove=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k,v){ nativeSet.call(this,k,v); if(this===localStorage&&SYNC_KEYS.has(k))scheduleSync(); };
  Storage.prototype.removeItem=function(k){ nativeRemove.call(this,k); if(this===localStorage&&SYNC_KEYS.has(k))scheduleSync(); };
  window.addEventListener("online",()=>syncAll(false));

  async function init(){
    if(!window.supabase?.createClient){ status("Cloud library couldn't load. Local mode is still working.","error"); return; }
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data:{session}}=await client.auth.getSession(); currentUser=session?.user||null; renderAccount();
    client.auth.onAuthStateChange((event,session)=>{
      currentUser=session?.user||null; renderAccount();
      if(event==="PASSWORD_RECOVERY") setTimeout(()=>btcOpenAuth("newpassword"),0);
      if(currentUser && ["SIGNED_IN","INITIAL_SESSION","TOKEN_REFRESHED"].includes(event)){
        btcCloseAuth();
        setTimeout(()=>syncAll(false),0);
      }
    });
    if(currentUser) syncAll(false); else status("Sign in to enable cloud backup.");
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
