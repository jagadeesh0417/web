import cv2
import numpy as np
import streamlit as st
from image_processing import process, quality
from pdf_report import create_report

st.set_page_config(page_title='STRUCTURA-AI', layout='wide')
st.title('STRUCTURA-AI')
st.warning('Preliminary visual inspection support only. Photographs cannot establish structural safety or internal corrosion. Consult a qualified engineer. Manual review is required.')
st.info('Research prototype: no trained model is included. Classical threshold regions are not crack detections. No inspection priority is produced without a validated model.')
file = st.file_uploader('Upload a concrete photograph', type=['jpg', 'jpeg', 'png'])
if file is not None:
    if file.size > 20 * 1024 * 1024:
        st.error('Image exceeds the 20 MB limit.')
        st.stop()
    encoded = np.frombuffer(file.getvalue(), np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        st.error('Invalid image; upload a valid JPEG or PNG.')
        st.stop()
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    if image.shape[0] * image.shape[1] > 20_000_000:
        st.error('Image exceeds 20 megapixels.')
        st.stop()
    st.subheader('Image measurements — not structural measurements')
    st.json(quality(image))
    st.download_button('Download image-processing PDF (no diagnosis)', create_report(image, quality(image)),
                       file_name='structura_image_report.pdf', mime='application/pdf')
    st.subheader('Processing stages')
    st.caption('HSV and Lab panels display encoded channel values as false colours. Binary and contour panels are candidate regions, not identified defects.')
    stages = process(image)
    cols = st.columns(3)
    for i, (name, img) in enumerate(stages.items()):
        cols[i % 3].image(img, caption=name, use_container_width=True, clamp=True)
