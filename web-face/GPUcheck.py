import onnxruntime as ort

print("Provider yang tersedia:")
print(ort.get_available_providers())

# Output yang diharapkan jika SUKSES:
# ['CUDAExecutionProvider', 'CPUExecutionProvider']

# Output jika GAGAL (masih pakai CPU):
# ['CPUExecutionProvider']