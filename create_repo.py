import subprocess
import urllib.request
import json
import sys

def get_git_credentials():
    proc = subprocess.Popen(
        ["git", "credential", "fill"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = proc.communicate(input="protocol=https\nhost=github.com\n\n")
    creds = {}
    for line in stdout.splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            creds[k.strip()] = v.strip()
    return creds

def create_and_push():
    creds = get_git_credentials()
    username = creds.get("username")
    token = creds.get("password")

    if not username or not token:
        print("Error: Could not retrieve GitHub credentials from git-credential-manager.")
        sys.exit(1)

    print(f"[*] Found GitHub User: {username}")

    repo_name = "Honey-Token-Deception-Architecture"
    api_url = "https://api.github.com/user/repos"

    headers = {
        "Authorization": f"token {token}",
        "User-Agent": "HoneyGuard-Deployer",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    }

    # Check if repo exists
    check_req = urllib.request.Request(
        f"https://api.github.com/repos/{username}/{repo_name}",
        headers=headers,
        method="GET"
    )
    repo_url = None
    try:
        with urllib.request.urlopen(check_req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[!] Repository '{repo_name}' already exists at: {data.get('html_url')}")
            repo_url = data.get("clone_url")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"[*] Creating new repository '{repo_name}' on GitHub...")
            payload = json.dumps({
                "name": repo_name,
                "description": "HONEYGUARD: Honey-Token & Deception Architecture for Internal Threat Detection SOC Platform.",
                "private": False,
                "auto_init": False
            }).encode()

            create_req = urllib.request.Request(api_url, data=payload, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(create_req) as resp:
                    data = json.loads(resp.read().decode())
                    repo_url = data.get("clone_url")
                    print(f"[+] Successfully created repository: {data.get('html_url')}")
            except Exception as create_err:
                print(f"[-] Failed to create repo: {create_err}")
                if hasattr(create_err, 'read'):
                    print(create_err.read().decode())
                sys.exit(1)
        else:
            print(f"[-] Error checking repo: {e}")
            sys.exit(1)

    if not repo_url:
        repo_url = f"https://github.com/{username}/{repo_name}.git"

    # Git commands
    print("[*] Initializing local git repository...")
    subprocess.run(["git", "init"], check=True)
    subprocess.run(["git", "config", "user.name", username], check=True)
    subprocess.run(["git", "config", "user.email", f"{username}@users.noreply.github.com"], check=True)

    print("[*] Staging files...")
    subprocess.run(["git", "add", "."], check=True)

    print("[*] Committing files...")
    status_proc = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True)
    if status_proc.stdout.strip():
        subprocess.run(["git", "commit", "-m", "Initial commit: Complete HONEYGUARD Deception Architecture & Threat Detection SOC Platform"], check=True)
    else:
        print("[!] No new changes to commit.")

    subprocess.run(["git", "branch", "-M", "main"], check=True)

    # Set remote
    remote_proc = subprocess.run(["git", "remote"], capture_output=True, text=True)
    if "origin" in remote_proc.stdout.split():
        subprocess.run(["git", "remote", "set-url", "origin", repo_url], check=True)
    else:
        subprocess.run(["git", "remote", "add", "origin", repo_url], check=True)

    print(f"[*] Pushing to origin main ({repo_url})...")
    # Push with credential in URL if needed or standard push
    auth_url = f"https://{username}:{token}@github.com/{username}/{repo_name}.git"
    push_proc = subprocess.run(["git", "push", "-u", auth_url, "main", "--force"], capture_output=True, text=True)

    if push_proc.returncode == 0:
        print("[+] SUCCESS! Project pushed to GitHub successfully.")
        # Reset remote to clean URL without embedded token
        subprocess.run(["git", "remote", "set-url", "origin", repo_url], check=True)
        print(f"[+] Repository URL: https://github.com/{username}/{repo_name}")
    else:
        print("[-] Git push failed:")
        print(push_proc.stderr)
        sys.exit(1)

if __name__ == "__main__":
    create_and_push()
