create or replace function sign_out_v2()
returns void
language plpgsql
security definer
as $$
begin
  -- No need to do anything here, as the client-side sign out will invalidate the session.
  return;
end;
$$;
