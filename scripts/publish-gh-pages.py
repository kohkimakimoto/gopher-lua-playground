#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse, os, sys, subprocess, textwrap, shutil, tempfile, platform, datetime, time, hashlib

VERSION = "0.0.1"
FIRST_COMMIT_MSG = "Init by publish-gh-pages.py"

class GitHubPagesWorkspace(object):
    def __init__(self, branch="gh-pages"):
        self.branch = branch
        self.wd = None
        self.tempdir = None
        self.worktreedir = None
        self.cleaned = False
        self.branch_exists = False
        # check the local branch existence
        ret = subprocess.run("git show-ref --verify -q refs/heads/%(branch)s" % {"branch": self.branch}, shell=True)
        if ret.returncode == 0:
            self.branch_exists = True
        else:
            # check the remote branch existence
            ret = subprocess.run("git show-ref --verify -q refs/remotes/origin/%(branch)s" % {"branch": self.branch}, shell=True)
            if ret.returncode == 0:
                self.branch_exists = True

    def init_branch(self):
        if self.branch_exists:
            raise RuntimeError("The '%(branch)s' branch has already existed." % {"branch": self.branch})
        self._init_worktree()
        subprocess.run("git checkout -q --orphan %(branch)s" % {"branch": self.branch}, shell=True, check=True)
        subprocess.run("git rm -q -rf .", shell=True, check=True)
        open(".nojekyll", "a").close()
        subprocess.run('git add -A && git commit -q -m"%(msg)s"' % {"msg": FIRST_COMMIT_MSG}, shell=True, check=True)

    def publish(self, dir, message):
        self._require_branch_existence()
        self._init_worktree()
        self._checkout()

        # clean files in the source branch
        subprocess.run("git rm -q -rf .", shell=True, check=True)
        open(".nojekyll", "a").close()

        # copy files to the source branch
        os.chdir(self.wd)
        subprocess.run('cp -pr "%(dir)s/." "%(worktreedir)s/"' % {"dir": dir, "worktreedir": self.worktreedir}, shell=True, check=True)
        os.chdir(self.worktreedir)
        self._commit(message)

    def clean(self):
        if self.cleaned:
            return
        if self.wd is not None:
            # back to the original repository workspace
            os.chdir(self.wd)
        if self.tempdir is not None:
            # delete temporary worktree.
            shutil.rmtree(self.tempdir)
            subprocess.run("git worktree prune", shell=True, check=True)
        self.cleaned = True

    def _init_worktree(self):
        # preserve current working directory to come back after operations.
        self.wd = os.getcwd()
        # create temporary directory and worktree of the Github Pages branch
        self.tempdir = tempfile.mkdtemp("", "publish-gh-pages-")
        self.worktreedir = os.path.join(self.tempdir, self.branch)
        # create worktree and go into the worktree directory.
        subprocess.run("git worktree add -q --detach %(worktreedir)s" % {"worktreedir": self.worktreedir}, shell=True, check=True)
        os.chdir(self.worktreedir)

    def _require_branch_existence(self):
        if not self.branch_exists:
            raise RuntimeError("Not found '%(branch)s' branch" % {"branch": self.branch})

    def _checkout(self):
        subprocess.run("git checkout -q %(branch)s" % {"branch": self.branch}, shell=True, check=True)

    def _commit(self, message):
        subprocess.run('git add -A && git commit -q -m"%(message)s" --allow-empty' % {"message": message}, shell=True, check=True)

def init_command(args):
    try:
        w = GitHubPagesWorkspace(branch=args.branch)
        w.init_branch()
    finally:
        w.clean()


def publish_command(args):
    try:
        w = GitHubPagesWorkspace(branch=args.branch)
        w.publish(args.dir, args.message)
    finally:
        w.clean()


def main():
    parser = argparse.ArgumentParser(
        description="A tool for publishing GitHub Pages.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent(
            """\
            Version %(version)s
            Copyright (c) Kohki Makimoto <kohki.makimoto@gmail.com>
            The MIT License (MIT)
        """
            % {"version": VERSION}
        ),
    )
    parser.add_argument("-v", "--version", dest="version", action="store_true", help="print the version number")
    subparsers = parser.add_subparsers(title="subcommands")

    # init
    parser_init = subparsers.add_parser("init", help="Init a source branch that is used for hosting GitHub Pages.", description="Init a source branch that is used for hosting GitHub Pages.")
    parser_init.add_argument("-b", "--branch", dest="branch", default="gh-pages", metavar="BRANCH_NAME", help="Specify the GitHub Pages BRANCH_NAME. Default 'gh-pages'.")
    parser_init.set_defaults(func=init_command)

    # publish
    parser_publish = subparsers.add_parser("publish", help="Copy a directory to the GitHub Pages source branch.", description="Copy a directory to the GitHub Pages source branch.")
    parser_publish.add_argument("-b", "--branch", dest="branch", default="gh-pages", metavar="BRANCH_NAME", help="Specify the GitHub Pages BRANCH_NAME. Default 'gh-pages'.")
    parser_publish.add_argument("-m", "--message", dest="message", default="updated by publish-gh-pages.py", metavar="STRING", help="Specify the Commit message.")
    parser_publish.add_argument("dir", metavar="DIRECTORY", help="Directory path you want to publish as a Github Pages site.")
    parser_publish.set_defaults(func=publish_command)
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(1)

    args = parser.parse_args()
    if args.version:
        print(VERSION)
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()

