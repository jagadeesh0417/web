# Dataset research and acquisition

Research performed 2026-11-11. Published numbers are not local counts.

* **NCCD-PF:** Tomaszkiewicz and Owerko, AGH University, [Zenodo record 8215100](https://zenodo.org/records/8215100), CC BY 4.0. Official open ZIP (63.7 MB), publisher MD5 `ca7bf252351bfb191b20d0a13ee9cedf`, no registration stated. The [data paper](https://www.nature.com/articles/s41597-023-02839-z) describes 5,388 JPEG images and paired PNG binary pixel masks, narrow concrete cracks only. It also contains classification data. Attribution is required. Images of the same structure may be related: independent structure-level splits require source identifiers; do not claim leakage-free evaluation without those identifiers.
* **MDMCS:** [official Mendeley record](https://data.mendeley.com/datasets/6x4dzzrs2h/2), CC BY 4.0, pixelwise multi-damage segmentation. Published description reports 1,200 images. The actual archive format, class map and access mechanism have not been locally inspected; not automatically imported. Review the record and its terms before downloading.
* **ConViD:** [official Mendeley record](https://data.mendeley.com/datasets/fx3rthfjhy), describes JPEG photographs of cracks, spalling, honeycombing and voids. Licence, actual annotations, download requirements and format are not yet verified; do not assume masks are available. Not downloaded.
* **Concrete Crack Segmentation Dataset:** Özgenel, [Mendeley record](https://data.mendeley.com/datasets/jwsn7tfbrp/1), CC BY 4.0. Publisher describes 458 photographs and paired binary alpha maps; access and archive contents have not been checked locally. Not downloaded.

Rust, exposed reinforcement and other classes are not supported by the NCCD-PF binary label scheme. These are research leads, not verified operational model capabilities. Local acquisition status is stored in `data/metadata/acquisition.json` after running the downloader.

## Local inspection

The official archive was downloaded and its publisher MD5 verified. Inspection found 5,388 matching, readable segmentation pairs: 715 masks containing positive pixels and 4,673 empty masks. An exploratory exact-duplicate-grouped split yielded 3,771 training, 808 validation, and 809 test pairs. No exact decoded-image duplicates were found. The split does not establish source independence and does not exclude near duplicates. Run `python prepare_dataset.py` to regenerate local metadata and the manifest.
