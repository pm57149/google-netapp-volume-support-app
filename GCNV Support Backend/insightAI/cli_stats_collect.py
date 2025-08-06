import paramiko
import concurrent.futures
import os

# ONTAP CLI credentials
ONTAP_HOST = os.getenv("ONTAP_HOST")
USERNAME = os.getenv("ONTAP_USERNAME")
PASSWORD = os.getenv("ONTAP_PASSWORD")
FIELDS ="access_latency|avg_latency|other_latency|other_ops|read_blocks|read_data|read_latency|write_blocks|write_data|write_latency"

def run_ontap_command(ssh, command):
    stdin, stdout, stderr = ssh.exec_command(command)

    output = stdout.read().decode()
    error = stderr.read().decode()
    if error:
        print(f"Error: {error}")

    return output

def process_volume(volume, sample_id):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ONTAP_HOST, username=USERNAME, password=PASSWORD)

    try:
        vol_stats_table_cmd = f"set diagnostic -confirmations off; statistics volume show -volume {volume}"
        vol_stats_table_output = run_ontap_command(ssh, vol_stats_table_cmd)
        vol_stats_table_output = "\n".join(
            line for line in vol_stats_table_output.splitlines()
            if "Last login" not in line and "Unsuccessful" not in line
        )

        vol_stats_cmd = f"set diagnostic -confirmations off; statistics show -sample-id {sample_id} -counter {FIELDS}"
        vol_stats_output = run_ontap_command(ssh, vol_stats_cmd)
        vol_stats_output = "\n".join(
            line for line in vol_stats_output.splitlines()
            if "Last login" not in line and "Unsuccessful" not in line
        )

        vol_show_snapshot_policy_cmd = f"snapshot policy show -instance {volume}"
        vol_show_snapshot_policy_output = run_ontap_command(ssh, vol_show_snapshot_policy_cmd)
        vol_show_snapshot_policy_output = "\n".join(
            line for line in vol_show_snapshot_policy_output.splitlines()
            if "Last login" not in line and "Unsuccessful" not in line
        )

        return {
            "volume": volume,
            "vol_stats_table_output": vol_stats_table_output,
            "vol_stats_output": vol_stats_output,
            "vol_show_snapshot_policy_output": vol_show_snapshot_policy_output,
        }
    finally:
        ssh.close()

def fetch_metrics_data(volumes):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(ONTAP_HOST, username=USERNAME, password=PASSWORD)

    pool_qos_show_cmd = "qos policy-group show -vserver *-gcnv -fields throughput-policy"
    qos_output = run_ontap_command(ssh, pool_qos_show_cmd)

    # Create a directory with a constant name
    output_dir = "metrics_data"
    os.makedirs(output_dir, exist_ok=True)
    metrics_file_path = os.path.join(output_dir, 'stats_output.txt')
    sample_ids_path = os.path.join(output_dir, 'sample_ids.txt')

    with open(metrics_file_path, 'w') as outfile:
        outfile.write("Minimum-Maximum IOPS, Throughput(MB/s) for overall volumes\n")
        for line in qos_output.splitlines():
            if "gcnv-qos-policy" in line:
                outfile.write(line.split()[-1] + "\n\n")

    ssh.close()

    if not os.path.exists(sample_ids_path):
        with open(sample_ids_path, 'w') as f:
            for volume in volumes:
                ssh = paramiko.SSHClient()
                ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                ssh.connect(ONTAP_HOST, username=USERNAME, password=PASSWORD)

                show_cmd = f"set diagnostic -confirmations off; statistics start -object volume -instance {volume}"
                output = run_ontap_command(ssh, show_cmd)
                sample_id = output.split("sample_")[-1].strip()
                f.write(f"{volume}: sample_{sample_id}\n")

                ssh.close()

    volume_sample_ids = {}
    with open(sample_ids_path, 'r') as f:
        for line in f:
            volume, sample_id = line.strip().split(': ')
            volume_sample_ids[volume] = sample_id

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_volume = {
            executor.submit(process_volume, volume, sample_id): volume
            for volume, sample_id in volume_sample_ids.items()
        }

        for future in concurrent.futures.as_completed(future_to_volume):
            try:
                results.append(future.result())
            except Exception as e:
                print(f"Error processing volume: {e}")

    # Write all results to the file at the end
    with open(metrics_file_path, 'a') as f:
        for result in results:
            f.write(f"\nVolume: {result['volume']}\n")
            f.write(result["vol_stats_table_output"] + "\n\n")
            f.write(result["vol_stats_output"] + "\n\n")
            if "no entries matching" in result["vol_show_snapshot_policy_output"]:
                f.write(f"\nSnapshot Policy for Volume {result['volume']}: None\n\n")
            else:
                f.write(f"\nSnapshot Policy for Volume {result['volume']}:\n")
                f.write(result["vol_show_snapshot_policy_output"] + "\n\n")

    return {"metrics_file_path": metrics_file_path}

if __name__ == "__main__":
    volumes = ["vol1", "vol2", "vol3"]
    fetch_metrics_data(volumes)
